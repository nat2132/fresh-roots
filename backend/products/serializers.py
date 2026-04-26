from rest_framework import serializers
from .models import Product, Category
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'product_count']

    def get_product_count(self, obj):
        return obj.products.count()


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    farmer_name = serializers.CharField(source='farmer.farm_name', read_only=True)
    farmer_username = serializers.CharField(source='farmer.username', read_only=True)
    freshness_score = serializers.IntegerField(read_only=True)
    freshness_label = serializers.CharField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'category', 'price', 'unit',
                  'stock_quantity', 'image', 'harvest_date', 'origin_location',
                  'is_organic', 'is_featured', 'farmer_name', 'farmer_username',
                  'freshness_score', 'freshness_label', 'in_stock', 'created_at']


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    farmer = UserSerializer(read_only=True)
    freshness_score = serializers.IntegerField(read_only=True)
    freshness_label = serializers.CharField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'story', 'category', 'price',
                  'unit', 'stock_quantity', 'image', 'harvest_date', 'origin_location',
                  'is_organic', 'is_featured', 'farmer', 'freshness_score',
                  'freshness_label', 'in_stock', 'created_at', 'updated_at']
