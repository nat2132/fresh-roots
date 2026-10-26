from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusLog


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'farmer_code', 'batch_number',
            'quantity', 'price', 'unit', 'subtotal',
        ]


class OrderStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = OrderStatusLog
        fields = ['id', 'from_status', 'to_status', 'changed_by', 'changed_by_name',
                  'note', 'created_at']
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    """Full order detail for customer/admin."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_step = serializers.IntegerField(read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_logs = OrderStatusLogSerializer(many=True, read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'status_step',
            'payment_method', 'payment_method_display',
            'subtotal', 'delivery_fee', 'total',
            'delivery_address', 'delivery_phone', 'notes',
            'verification_code',
            'warehouse', 'items', 'status_logs', 'has_review',
            'created_at', 'updated_at',
        ]

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Only show verification code to the order owner
        if request and hasattr(request, 'user'):
            if request.user != instance.user and request.user.role != 'admin':
                data.pop('verification_code', None)
        return data


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight order list (no items, no logs)."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_step = serializers.IntegerField(read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'status_step',
            'payment_method', 'total', 'item_count',
            'created_at', 'updated_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class CreateOrderSerializer(serializers.Serializer):
    """Create an order from the customer's cart."""
    delivery_address = serializers.CharField()
    delivery_phone = serializers.CharField(required=False, default='')
    payment_method = serializers.ChoiceField(choices=['cod', 'digital'])
    notes = serializers.CharField(required=False, default='')
    coupon_code = serializers.CharField(required=False, allow_blank=True)


class UpdateOrderStatusSerializer(serializers.Serializer):
    """Update order status (staff only)."""
    status = serializers.ChoiceField(choices=[s[0] for s in Order.STATUS_CHOICES])
    note = serializers.CharField(required=False, default='')
