from rest_framework import serializers
from .models import Warehouse, InventoryItem, QualityCheck, StockMovement


class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'location', 'manager', 'manager_name',
                  'capacity_description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    farmer_code = serializers.CharField(source='product.farmer.farmer_code', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'product', 'product_name', 'warehouse', 'warehouse_name',
            'batch', 'batch_number', 'farmer_code',
            'quantity', 'reserved_quantity', 'available_quantity',
            'storage_location', 'received_at', 'updated_at',
        ]
        read_only_fields = ['id', 'received_at', 'updated_at']


class ReceiveStockSerializer(serializers.Serializer):
    """Serializer for receiving new stock from procurement."""
    product_id = serializers.IntegerField()
    warehouse_id = serializers.IntegerField()
    batch_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    storage_location = serializers.CharField(max_length=100, required=False, default='')


class QualityCheckSerializer(serializers.ModelSerializer):
    checked_by_name = serializers.CharField(source='checked_by.get_full_name', read_only=True)

    class Meta:
        model = QualityCheck
        fields = ['id', 'inventory_item', 'checked_by', 'checked_by_name',
                  'result', 'temperature', 'notes', 'checked_at']
        read_only_fields = ['id', 'checked_by', 'checked_at']


class StockMovementSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = StockMovement
        fields = ['id', 'inventory_item', 'movement_type', 'quantity_change',
                  'quantity_after', 'reference', 'performed_by', 'performed_by_name',
                  'notes', 'created_at']
        read_only_fields = fields
