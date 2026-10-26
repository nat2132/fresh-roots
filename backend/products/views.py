from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsContentManager
from .models import Product, Category
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    ProductManageSerializer, CategorySerializer, TraceabilitySerializer,
)


class CategoryListView(generics.ListAPIView):
    """Public: list all categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CategoryManageView(generics.ListCreateAPIView):
    """Content Manager: CRUD categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsContentManager]


class ProductListView(generics.ListAPIView):
    """Public: list visible products with filters."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'is_organic': ['exact'],
        'is_featured': ['exact'],
        'price': ['gte', 'lte'],
    }
    search_fields = ['name', 'description', 'origin_location', 'farmer__full_name']
    ordering_fields = ['price', 'harvest_date', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(
            is_visible=True
        ).select_related('category', 'farmer', 'batch')


class ProductDetailView(generics.RetrieveAPIView):
    """Public: product detail with traceability."""
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(
            is_visible=True
        ).select_related('category', 'farmer', 'batch')


class FeaturedProductsView(generics.ListAPIView):
    """Public: featured products."""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(
            is_featured=True, is_visible=True
        ).select_related('category', 'farmer')


class ProductTraceabilityView(generics.RetrieveAPIView):
    """Public: traceability info (farmer code, batch, origin)."""
    serializer_class = TraceabilitySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(
            is_visible=True
        ).select_related('farmer', 'batch')


# --- Content Manager views ---

class ProductManageListCreateView(generics.ListCreateAPIView):
    """Content Manager: list ALL products (including hidden) and create new ones."""
    permission_classes = [IsContentManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'farmer', 'is_visible', 'is_featured']
    search_fields = ['name', 'farmer__farmer_code']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.select_related('category', 'farmer', 'batch').all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductManageSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProductManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Content Manager: edit/delete products."""
    serializer_class = ProductManageSerializer
    permission_classes = [IsContentManager]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.select_related('category', 'farmer', 'batch').all()
