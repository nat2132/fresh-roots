from rest_framework import serializers
from .models import Review
from orders.models import Order


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    order_number = serializers.ReadOnlyField(source='order.order_number')

    class Meta:
        model = Review
        fields = [
            'id', 'order', 'order_number', 'user', 'user_name', 
            'rating', 'comment', 'image', 'created_at'
        ]
        read_only_fields = ['user']

    def validate_order(self, value):
        # Ensure order is completed
        if value.status != 'completed':
            raise serializers.ValidationError("Reviews can only be left for completed orders.")
        
        # Ensure user is the owner of the order
        request = self.context.get('request')
        if request and value.user != request.user:
            raise serializers.ValidationError("You can only review your own orders.")
            
        return value
