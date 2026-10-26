from rest_framework import serializers
from .models import Farmer


class FarmerSerializer(serializers.ModelSerializer):
    """Full farmer serializer for admin CRUD."""
    total_batches = serializers.IntegerField(read_only=True)
    total_products = serializers.IntegerField(read_only=True)
    registered_by_name = serializers.CharField(
        source='registered_by.get_full_name', read_only=True
    )

    class Meta:
        model = Farmer
        fields = [
            'id', 'farmer_code', 'full_name', 'phone', 'email',
            'location', 'region', 'notes', 'is_active',
            'registered_by', 'registered_by_name',
            'total_batches', 'total_products',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'farmer_code', 'registered_by', 'created_at', 'updated_at']


class FarmerMinimalSerializer(serializers.ModelSerializer):
    """Minimal farmer info for embedding in product responses."""
    class Meta:
        model = Farmer
        fields = ['id', 'farmer_code', 'full_name', 'location', 'region']
        read_only_fields = fields
