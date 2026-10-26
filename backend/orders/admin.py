from django.contrib import admin
from .models import Order, OrderItem, OrderStatusLog


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'farmer_code', 'batch_number', 'quantity', 'price', 'unit']


class OrderStatusLogInline(admin.TabularInline):
    model = OrderStatusLog
    extra = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'note', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'payment_method', 'total', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['order_number', 'user__username']
    readonly_fields = ['order_number', 'verification_code', 'created_at', 'updated_at']
    inlines = [OrderItemInline, OrderStatusLogInline]
