from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'unit', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_step = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'status_display', 'status_step', 'total',
                  'delivery_address', 'notes', 'items', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    notes = serializers.CharField(required=False, default='')
