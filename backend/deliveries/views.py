from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction

from core.permissions import IsAdmin, IsDeliveryPartner
from orders.models import Order
from .models import Delivery, DeliveryLocationLog
from .serializers import (
    DeliverySerializer, AssignDeliverySerializer,
    DeliverVerifySerializer, DeliveryLocationLogSerializer,
)


class AssignDeliveryView(APIView):
    """Admin: assign a delivery partner to a packed order."""
    permission_classes = [IsAdmin]

    @transaction.atomic
    def post(self, request):
        serializer = AssignDeliverySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = Order.objects.get(order_number=data['order_number'])
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'packed':
            return Response(
                {'error': f'Order must be "packed" to assign delivery. Current: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            partner = User.objects.get(id=data['partner_id'], role='delivery_partner')
        except User.DoesNotExist:
            return Response({'error': 'Delivery partner not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Create delivery
        delivery = Delivery.objects.create(
            order=order,
            partner=partner,
            estimated_delivery=data.get('estimated_delivery'),
            notes=data.get('notes', ''),
        )

        # Transition order
        order.transition_to('assigned', changed_by=request.user, note=f'Assigned to {partner.get_full_name()}')

        # Mark partner as unavailable
        partner.is_available = False
        partner.save(update_fields=['is_available'])

        return Response(DeliverySerializer(delivery).data, status=status.HTTP_201_CREATED)

class AdminDeliveriesView(generics.ListAPIView):
    """Admin: list all deliveries."""
    serializer_class = DeliverySerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['status']
    ordering = ['-assigned_at']

    def get_queryset(self):
        return Delivery.objects.all().select_related('order', 'order__user', 'partner')

class MyDeliveriesView(generics.ListAPIView):
    """Delivery Partner: list own assigned deliveries."""
    serializer_class = DeliverySerializer
    permission_classes = [IsDeliveryPartner]
    filterset_fields = ['status']

    def get_queryset(self):
        return Delivery.objects.filter(
            partner=self.request.user
        ).select_related('order', 'order__user', 'partner')


class PickupDeliveryView(APIView):
    """Delivery Partner: mark order as picked up from warehouse."""
    permission_classes = [IsDeliveryPartner]

    @transaction.atomic
    def put(self, request, pk):
        try:
            delivery = Delivery.objects.select_related('order').get(
                pk=pk, partner=request.user
            )
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status != 'assigned':
            return Response({'error': 'Delivery must be "assigned" to pick up.'}, status=status.HTTP_400_BAD_REQUEST)

        delivery.status = 'picked_up'
        delivery.pickup_time = timezone.now()
        delivery.save()

        delivery.order.transition_to('out_for_delivery', changed_by=request.user, note='Picked up from warehouse.')

        return Response(DeliverySerializer(delivery).data)


class InTransitDeliveryView(APIView):
    """Delivery Partner: mark as in transit."""
    permission_classes = [IsDeliveryPartner]

    def put(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk, partner=request.user)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status != 'picked_up':
            return Response({'error': 'Must be "picked_up" first.'}, status=status.HTTP_400_BAD_REQUEST)

        delivery.status = 'in_transit'
        delivery.save()

        return Response(DeliverySerializer(delivery).data)


class DeliverVerifyView(APIView):
    """
    Delivery Partner: mark as delivered with verification code.

    CRITICAL: The verification code MUST match the order's code.
    This is the only way to confirm delivery.
    """
    permission_classes = [IsDeliveryPartner]

    @transaction.atomic
    def put(self, request, pk):
        serializer = DeliverVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            delivery = Delivery.objects.select_related('order').get(
                pk=pk, partner=request.user
            )
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status not in ('picked_up', 'in_transit'):
            return Response(
                {'error': 'Delivery must be in transit or picked up.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # VERIFY CODE
        if not delivery.verify_code(data['verification_code']):
            return Response(
                {'error': 'Invalid verification code. Delivery NOT confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark delivery as verified
        delivery.status = 'verified'
        delivery.is_verified = True
        delivery.verification_code_entered = data['verification_code']
        delivery.delivery_time = timezone.now()
        delivery.recipient_name = data.get('recipient_name', '')
        delivery.notes = data.get('notes', delivery.notes)
        delivery.save()

        # Transition order to delivered
        delivery.order.transition_to(
            'delivered',
            changed_by=request.user,
            note='Delivery verified with customer code.'
        )

        # For COD: order completes after payment confirmation (separate step)
        # For Digital: auto-complete since payment is already confirmed
        if delivery.order.payment_method == 'digital':
            delivery.order.transition_to(
                'completed',
                changed_by=request.user,
                note='Auto-completed: digital payment + verified delivery.'
            )

        # Mark partner available again
        request.user.is_available = True
        request.user.save(update_fields=['is_available'])

        return Response(DeliverySerializer(delivery).data)


class DeliveryLocationUpdateView(APIView):
    """Delivery Partner: send GPS location update."""
    permission_classes = [IsDeliveryPartner]

    def post(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk, partner=request.user)
        except Delivery.DoesNotExist:
            return Response({'error': 'Delivery not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status not in ('picked_up', 'in_transit'):
            return Response({'error': 'Location updates only during transit.'}, status=status.HTTP_400_BAD_REQUEST)

        loc_serializer = DeliveryLocationLogSerializer(data=request.data)
        loc_serializer.is_valid(raise_exception=True)
        loc_serializer.save(delivery=delivery)

        return Response(loc_serializer.data, status=status.HTTP_201_CREATED)


class DeliveryLocationHistoryView(generics.ListAPIView):
    """View location history for a delivery (customer tracking)."""
    serializer_class = DeliveryLocationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        delivery_id = self.kwargs['pk']
        return DeliveryLocationLog.objects.filter(delivery_id=delivery_id)
