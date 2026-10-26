from rest_framework import serializers
from .models import Product, Category
from farmers.serializers import FarmerMinimalSerializer


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'sort_order', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_visible=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    """Public product listing — hides internal fields like cost_price."""
    category = CategorySerializer(read_only=True)
    farmer_code = serializers.CharField(source='farmer.farmer_code', read_only=True)
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farmer_location = serializers.CharField(source='farmer.location', read_only=True)
    freshness_score = serializers.IntegerField(read_only=True)
    freshness_label = serializers.CharField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'price', 'unit',
            'image', 'harvest_date', 'origin_location',
            'is_organic', 'is_featured',
            'farmer_code', 'farmer_name', 'farmer_location',
            'freshness_score', 'freshness_label', 'in_stock', 'total_stock',
            'created_at',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product detail with traceability info."""
    category = CategorySerializer(read_only=True)
    farmer = FarmerMinimalSerializer(read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    freshness_score = serializers.IntegerField(read_only=True)
    freshness_label = serializers.CharField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    total_stock = serializers.IntegerField(read_only=True)
    available_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'story', 'category',
            'price', 'unit', 'image', 'harvest_date', 'origin_location',
            'is_organic', 'is_featured', 'is_visible',
            'farmer', 'batch_number',
            'freshness_score', 'freshness_label',
            'in_stock', 'total_stock', 'available_stock',
            'created_at', 'updated_at',
        ]


class ProductManageSerializer(serializers.ModelSerializer):
    """Content Manager serializer for creating/editing products."""

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'story', 'category',
            'farmer', 'batch', 'price', 'cost_price', 'unit',
            'image', 'harvest_date', 'origin_location',
            'is_organic', 'is_featured', 'is_visible',
        ]
        read_only_fields = ['id']

    def validate_farmer(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Cannot link product to inactive farmer.")
        return value


class TraceabilitySerializer(serializers.ModelSerializer):
    """Public traceability info for a product."""
    farmer_code = serializers.CharField(source='farmer.farmer_code')
    farmer_name = serializers.CharField(source='farmer.full_name')
    farmer_location = serializers.CharField(source='farmer.location')
    batch_number = serializers.CharField(source='batch.batch_number', default=None)
    purchase_date = serializers.DateField(source='batch.purchase_date', default=None)

    class Meta:
        model = Product
        fields = [
            'id', 'name',
            'farmer_code', 'farmer_name', 'farmer_location',
            'batch_number', 'purchase_date',
            'harvest_date', 'origin_location',
        ]
