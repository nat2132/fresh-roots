from django.contrib import admin
from .models import Delivery, DeliveryLocationLog


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order', 'partner', 'status', 'is_verified', 'assigned_at', 'delivery_time']
    list_filter = ['status', 'is_verified']
    search_fields = ['order__order_number', 'partner__username']
    readonly_fields = ['assigned_at', 'updated_at']


@admin.register(DeliveryLocationLog)
class DeliveryLocationLogAdmin(admin.ModelAdmin):
    list_display = ['delivery', 'latitude', 'longitude', 'recorded_at']
    readonly_fields = ['recorded_at']
