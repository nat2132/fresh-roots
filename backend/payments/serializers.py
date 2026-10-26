from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    confirmed_by_name = serializers.CharField(
        source='confirmed_by.get_full_name', read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'method', 'amount', 'status',
            'transaction_id', 'payment_provider', 'payment_reference',
            'collected_amount', 'paid_at', 'confirmed_by', 'confirmed_by_name',
            'refund_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InitiatePaymentSerializer(serializers.Serializer):
    order_number = serializers.CharField()
    payment_provider = serializers.CharField(required=False, default='')


class ConfirmCODSerializer(serializers.Serializer):
    collected_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    verification_code = serializers.CharField(max_length=6)
