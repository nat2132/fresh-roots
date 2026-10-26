from django.urls import path
from . import views

urlpatterns = [
    path('', views.FarmerListCreateView.as_view(), name='farmer_list_create'),
    path('<str:farmer_code>/', views.FarmerDetailView.as_view(), name='farmer_detail'),
    path('<str:farmer_code>/supply-history/', views.FarmerSupplyHistoryView.as_view(), name='farmer_supply_history'),
]
