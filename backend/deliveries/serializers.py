from rest_framework import serializers
from .models import Delivery, DeliveryLocationLog


class DeliveryLocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLocationLog
        fields = ['id', 'latitude', 'longitude', 'accuracy', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class DeliverySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    partner_name = serializers.CharField(source='partner.get_full_name', read_only=True)
    delivery_address = serializers.CharField(source='order.delivery_address', read_only=True)
    delivery_phone = serializers.CharField(source='order.delivery_phone', read_only=True)
    customer_name = serializers.CharField(source='order.user.get_full_name', read_only=True)
    latest_location = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'order_number', 'partner', 'partner_name',
            'status', 'delivery_address', 'delivery_phone', 'customer_name',
            'pickup_time', 'delivery_time', 'estimated_delivery',
            'is_verified', 'recipient_name',
            'proof_of_delivery', 'notes', 'failure_reason',
            'latest_location', 'assigned_at', 'updated_at',
        ]
        read_only_fields = ['id', 'assigned_at', 'updated_at']

    def get_latest_location(self, obj):
        loc = obj.locations.first()
        if loc:
            return DeliveryLocationLogSerializer(loc).data
        return None


class AssignDeliverySerializer(serializers.Serializer):
    order_number = serializers.CharField()
    partner_id = serializers.IntegerField()
    estimated_delivery = serializers.DateTimeField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, default='')


class DeliverVerifySerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=6)
    recipient_name = serializers.CharField(required=False, default='')
    notes = serializers.CharField(required=False, default='')
