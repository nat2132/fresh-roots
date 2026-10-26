from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Coupon
from .serializers import CouponSerializer, CouponApplySerializer
from core.permissions import IsAdmin


class CouponListView(generics.ListCreateAPIView):
    """Admin: manage coupons. Public: list active coupons (optional)."""
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Coupon.objects.all()
        return Coupon.objects.filter(active=True, valid_to__gte=timezone.now())


class CouponApplyView(APIView):
    """Validate and calculate discount for a coupon code."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']
        subtotal = serializer.validated_data['subtotal']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)

        if not coupon.is_valid:
            return Response({'error': 'This coupon is no longer valid.'}, status=status.HTTP_400_BAD_REQUEST)

        if subtotal < coupon.min_purchase:
            return Response(
                {'error': f'Minimum purchase of {coupon.min_purchase} ETB required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        discount = coupon.calculate_discount(subtotal)
        
        return Response({
            'code': coupon.code,
            'discount_amount': discount,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'new_total': subtotal - discount
        })
