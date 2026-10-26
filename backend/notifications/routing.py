from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^/?ws/orders/(?P<order_number>\w+)/?$', consumers.OrderTrackingConsumer.as_asgi()),
    re_path(r'^/?ws/delivery/(?P<delivery_id>\d+)/?$', consumers.DeliveryLocationConsumer.as_asgi()),
    re_path(r'^/?ws/dashboard/?$', consumers.AdminDashboardConsumer.as_asgi()),
]
