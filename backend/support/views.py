from rest_framework import generics, permissions
from .models import SupportTicket
from .serializers import SupportTicketSerializer

class SupportTicketListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return SupportTicket.objects.all().order_by('-created_at')
        return SupportTicket.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SupportTicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=user)
