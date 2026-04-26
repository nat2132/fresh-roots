from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product, Category
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.select_related('category', 'farmer').all()
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'is_organic': ['exact'],
        'is_featured': ['exact'],
        'price': ['gte', 'lte'],
    }
    search_fields = ['name', 'description', 'origin_location']
    ordering_fields = ['price', 'harvest_date', 'created_at', 'name']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('category', 'farmer').all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class FeaturedProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_featured=True).select_related('category', 'farmer')
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
