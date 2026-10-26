from rest_framework import generics
from core.permissions import IsAdmin, IsStaff
from .models import ProcurementBatch
from .serializers import ProcurementBatchSerializer, CreateProcurementBatchSerializer


class ProcurementBatchListCreateView(generics.ListCreateAPIView):
    """Staff: list batches. Admin: create new procurement batch."""
    permission_classes = [IsStaff]
    filterset_fields = ['farmer', 'payment_status']
    search_fields = ['batch_number', 'farmer__full_name', 'farmer__farmer_code']
    ordering_fields = ['purchase_date', 'total_cost', 'created_at']

    def get_queryset(self):
        return ProcurementBatch.objects.select_related('farmer', 'purchased_by').prefetch_related('items')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateProcurementBatchSerializer
        return ProcurementBatchSerializer

    def perform_create(self, serializer):
        serializer.save(purchased_by=self.request.user)


class ProcurementBatchDetailView(generics.RetrieveUpdateAPIView):
    """Staff: view batch details. Admin: update payment status."""
    serializer_class = ProcurementBatchSerializer
    permission_classes = [IsStaff]
    lookup_field = 'batch_number'

    def get_queryset(self):
        return ProcurementBatch.objects.select_related('farmer', 'purchased_by').prefetch_related('items')
