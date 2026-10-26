from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum, F

from core.permissions import IsAdmin, IsWarehouseManager
from .models import Warehouse, InventoryItem, QualityCheck, StockMovement
from .serializers import (
    WarehouseSerializer, InventoryItemSerializer,
    ReceiveStockSerializer, QualityCheckSerializer, StockMovementSerializer,
)


class WarehouseListCreateView(generics.ListCreateAPIView):
    """Admin: manage warehouses."""
    queryset = Warehouse.objects.select_related('manager')
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdmin]


class WarehouseDetailView(generics.RetrieveUpdateAPIView):
    queryset = Warehouse.objects.select_related('manager')
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdmin]


class InventoryListView(generics.ListAPIView):
    """Warehouse Manager / Admin: view all inventory."""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsWarehouseManager]
    filterset_fields = ['warehouse', 'product']
    search_fields = ['product__name', 'storage_location']
    ordering_fields = ['quantity', 'updated_at']

    def get_queryset(self):
        return InventoryItem.objects.select_related(
            'product', 'product__farmer', 'warehouse', 'batch'
        )


class ReceiveStockView(APIView):
    """Warehouse Manager: receive goods from procurement into inventory."""
    permission_classes = [IsWarehouseManager]

    @transaction.atomic
    def post(self, request):
        serializer = ReceiveStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        from products.models import Product
        try:
            product = Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            warehouse = Warehouse.objects.get(id=data['warehouse_id'])
        except Warehouse.DoesNotExist:
            return Response({'error': 'Warehouse not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Get or create inventory item
        inv_item, created = InventoryItem.objects.get_or_create(
            product=product,
            warehouse=warehouse,
            batch_id=data.get('batch_id'),
            defaults={
                'quantity': 0,
                'storage_location': data.get('storage_location', ''),
            }
        )

        # Update quantity
        inv_item.quantity += data['quantity']
        if data.get('storage_location'):
            inv_item.storage_location = data['storage_location']
        inv_item.save()

        # Log movement
        StockMovement.objects.create(
            inventory_item=inv_item,
            movement_type='received',
            quantity_change=data['quantity'],
            quantity_after=inv_item.quantity,
            reference=inv_item.batch.batch_number if inv_item.batch else '',
            performed_by=request.user,
        )

        return Response(
            InventoryItemSerializer(inv_item).data,
            status=status.HTTP_201_CREATED
        )


class QualityCheckCreateView(generics.CreateAPIView):
    """Warehouse Manager: perform quality check on inventory."""
    serializer_class = QualityCheckSerializer
    permission_classes = [IsWarehouseManager]

    def perform_create(self, serializer):
        serializer.save(checked_by=self.request.user)


class LowStockView(generics.ListAPIView):
    """Admin/Warehouse Manager: items with low stock."""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsWarehouseManager]

    def get_queryset(self):
        threshold = int(self.request.query_params.get('threshold', 10))
        return InventoryItem.objects.filter(
            quantity__lte=threshold
        ).select_related('product', 'warehouse', 'batch', 'product__farmer')


class StockMovementListView(generics.ListAPIView):
    """Admin: audit log of all stock movements."""
    serializer_class = StockMovementSerializer
    permission_classes = [IsWarehouseManager]
    filterset_fields = ['movement_type', 'reference']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return StockMovement.objects.select_related('inventory_item', 'performed_by')
