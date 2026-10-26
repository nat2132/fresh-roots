from django.urls import path
from . import views

urlpatterns = [
    path('warehouses/', views.WarehouseListCreateView.as_view(), name='warehouse_list_create'),
    path('warehouses/<int:pk>/', views.WarehouseDetailView.as_view(), name='warehouse_detail'),
    path('inventory/', views.InventoryListView.as_view(), name='inventory_list'),
    path('receive/', views.ReceiveStockView.as_view(), name='receive_stock'),
    path('quality-check/', views.QualityCheckCreateView.as_view(), name='quality_check_create'),
    path('low-stock/', views.LowStockView.as_view(), name='low_stock'),
    path('movements/', views.StockMovementListView.as_view(), name='stock_movements'),
]
