from django.urls import path
from .views import SupportTicketListCreateView, SupportTicketDetailView

urlpatterns = [
    path('', SupportTicketListCreateView.as_view(), name='ticket-list'),
    path('<int:pk>/', SupportTicketDetailView.as_view(), name='ticket-detail'),
]
