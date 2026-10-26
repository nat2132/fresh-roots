from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction

from core.permissions import IsAdmin, IsDeliveryPartner
from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer, ConfirmCODSerializer


class PaymentDetailView(generics.RetrieveAPIView):
    """View payment info for an order."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        order_number = self.kwargs['order_number']
        user = self.request.user

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            from django.http import Http404
            raise Http404

        # Customers can only see their own payments
        if user.role == 'customer' and order.user != user:
            from django.http import Http404
            raise Http404

        return Payment.objects.get(order=order)


class InitiatePaymentView(APIView):
    """Customer: initiate digital payment for an order."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(
                order_number=serializer.validated_data['order_number'],
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_method != 'digital':
            return Response({'error': 'This order uses COD.'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status not in ('pending', 'confirmed'):
            return Response(
                {'error': 'Payment can only be initiated for pending/confirmed orders.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or get payment record
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'method': 'digital',
                'amount': order.total,
                'status': 'processing',
                'payment_provider': serializer.validated_data.get('payment_provider', ''),
            }
        )

        if not created and payment.status == 'confirmed':
            return Response({'error': 'Payment already confirmed.'}, status=status.HTTP_400_BAD_REQUEST)

        # In production, this would redirect to payment gateway
        # For now, return payment info for frontend to handle
        return Response({
            'payment': PaymentSerializer(payment).data,
            'message': 'Payment initiated. Complete payment with your provider.',
        })


class PaymentWebhookView(APIView):
    """Payment gateway callback (digital payments)."""
    permission_classes = [permissions.AllowAny]  # Webhook — authenticated by signature

    @transaction.atomic
    def post(self, request):
        # In production: verify webhook signature from payment provider
        transaction_id = request.data.get('transaction_id')
        order_number = request.data.get('order_number')
        payment_status = request.data.get('status')  # 'success' or 'failed'

        try:
            order = Order.objects.get(order_number=order_number)
            payment = Payment.objects.get(order=order)
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment_status == 'success':
            payment.status = 'confirmed'
            payment.transaction_id = transaction_id or ''
            payment.paid_at = timezone.now()
            payment.save()

            # Transition order to 'paid'
            if order.can_transition_to('paid'):
                order.transition_to('paid', note='Digital payment confirmed.')
            elif order.status == 'pending':
                order.transition_to('confirmed', note='Payment received.')
                order.transition_to('paid', note='Digital payment confirmed.')
        else:
            payment.status = 'failed'
            payment.save()

        return Response({'status': 'ok'})


class ConfirmCODPaymentView(APIView):
    """Delivery partner: confirm COD payment after delivery."""
    permission_classes = [IsDeliveryPartner]

    @transaction.atomic
    def put(self, request, pk):
        serializer = ConfirmCODSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment = Payment.objects.select_related('order').get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.method != 'cod':
            return Response({'error': 'Not a COD payment.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify code
        verification_code = serializer.validated_data['verification_code']
        if verification_code != payment.order.verification_code:
            return Response(
                {'error': 'Invalid verification code.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = 'confirmed'
        payment.collected_amount = serializer.validated_data['collected_amount']
        payment.paid_at = timezone.now()
        payment.confirmed_by = request.user
        payment.save()

        return Response(PaymentSerializer(payment).data)
