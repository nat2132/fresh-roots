from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication & User Management
    path('api/auth/', include('accounts.urls')),

    # Farmers (Admin-only entity management)
    path('api/farmers/', include('farmers.urls')),

    # Procurement (Batch tracking)
    path('api/procurement/', include('procurement.urls')),

    # Products (Public + Content Manager)
    path('api/products/', include('products.urls')),

    # Warehouse (Inventory management)
    path('api/warehouse/', include('warehouse.urls')),

    # Cart
    path('api/cart/', include('cart.urls')),

    # Orders
    path('api/orders/', include('orders.urls')),

    # Payments
    path('api/payments/', include('payments.urls')),

    # Deliveries
    path('api/deliveries/', include('deliveries.urls')),
    
    # Feedback
    path('api/feedback/', include('feedback.urls')),
    
    # Promotions
    path('api/promotions/', include('promotions.urls')),
    path('api/support/', include('support.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
