from django.urls import path
from . import views

urlpatterns = [
    path('assign/', views.AssignDeliveryView.as_view(), name='delivery_assign'),
    path('admin-all/', views.AdminDeliveriesView.as_view(), name='admin_deliveries_list'),
    path('my-deliveries/', views.MyDeliveriesView.as_view(), name='my_deliveries'),
    path('<int:pk>/pickup/', views.PickupDeliveryView.as_view(), name='delivery_pickup'),
    path('<int:pk>/in-transit/', views.InTransitDeliveryView.as_view(), name='delivery_transit'),
    path('<int:pk>/deliver/', views.DeliverVerifyView.as_view(), name='delivery_verify'),
    path('<int:pk>/location/', views.DeliveryLocationUpdateView.as_view(), name='delivery_location_update'),
    path('<int:pk>/locations/', views.DeliveryLocationHistoryView.as_view(), name='delivery_location_history'),
]
