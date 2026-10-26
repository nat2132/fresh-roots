from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order_list'),
    path('admin-stats/', views.AdminStatsView.as_view(), name='admin_stats'),
    path('create/', views.CreateOrderView.as_view(), name='order_create'),
    path('<str:order_number>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/status/', views.UpdateOrderStatusView.as_view(), name='order_status_update'),
    path('<str:order_number>/tracking/', views.OrderTrackingView.as_view(), name='order_tracking'),
    path('<str:order_number>/reorder/', views.ReorderView.as_view(), name='order_reorder'),
]
