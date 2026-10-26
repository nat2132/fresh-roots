from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'method', 'amount', 'status', 'paid_at']
    list_filter = ['status', 'method']
    search_fields = ['order__order_number', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
