from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdmin
from .models import Farmer
from .serializers import FarmerSerializer


class FarmerListCreateView(generics.ListCreateAPIView):
    """Admin: list all farmers or create a new one."""
    serializer_class = FarmerSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['is_active', 'region', 'location']
    search_fields = ['farmer_code', 'full_name', 'phone', 'location']
    ordering_fields = ['created_at', 'full_name']

    def get_queryset(self):
        return Farmer.objects.all()

    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user)


class FarmerDetailView(generics.RetrieveUpdateAPIView):
    """Admin: view/update a farmer by farmer_code."""
    serializer_class = FarmerSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'farmer_code'

    def get_queryset(self):
        return Farmer.objects.all()


class FarmerSupplyHistoryView(APIView):
    """Admin: view all procurement batches from a farmer."""
    permission_classes = [IsAdmin]

    def get(self, request, farmer_code):
        try:
            farmer = Farmer.objects.get(farmer_code=farmer_code)
        except Farmer.DoesNotExist:
            return Response({'error': 'Farmer not found.'}, status=status.HTTP_404_NOT_FOUND)

        from procurement.serializers import ProcurementBatchSerializer
        batches = farmer.procurement_batches.all().order_by('-purchase_date')
        serializer = ProcurementBatchSerializer(batches, many=True)
        return Response({
            'farmer': FarmerSerializer(farmer).data,
            'supply_history': serializer.data,
        })
