from rest_framework import serializers
from .models import ProcurementBatch, BatchItem
from farmers.serializers import FarmerMinimalSerializer


class BatchItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = BatchItem
        fields = [
            'id', 'product_name', 'quantity', 'unit',
            'unit_cost', 'quality_grade', 'notes', 'line_total',
        ]


class ProcurementBatchSerializer(serializers.ModelSerializer):
    items = BatchItemSerializer(many=True, read_only=True)
    farmer_detail = FarmerMinimalSerializer(source='farmer', read_only=True)
    purchased_by_name = serializers.CharField(
        source='purchased_by.get_full_name', read_only=True
    )

    class Meta:
        model = ProcurementBatch
        fields = [
            'id', 'batch_number', 'farmer', 'farmer_detail',
            'purchased_by', 'purchased_by_name',
            'purchase_date', 'total_cost', 'payment_status',
            'amount_paid', 'notes', 'items', 'created_at',
        ]
        read_only_fields = ['id', 'batch_number', 'purchased_by', 'created_at']


class CreateProcurementBatchSerializer(serializers.ModelSerializer):
    items = BatchItemSerializer(many=True)

    class Meta:
        model = ProcurementBatch
        fields = ['farmer', 'purchase_date', 'total_cost', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        batch = ProcurementBatch.objects.create(**validated_data)
        for item_data in items_data:
            BatchItem.objects.create(batch=batch, **item_data)
        return batch
