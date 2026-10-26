from django.contrib import admin
from .models import ProcurementBatch, BatchItem


class BatchItemInline(admin.TabularInline):
    model = BatchItem
    extra = 1


@admin.register(ProcurementBatch)
class ProcurementBatchAdmin(admin.ModelAdmin):
    list_display = ['batch_number', 'farmer', 'purchase_date', 'total_cost', 'payment_status']
    list_filter = ['payment_status', 'purchase_date']
    search_fields = ['batch_number', 'farmer__full_name', 'farmer__farmer_code']
    readonly_fields = ['batch_number', 'created_at']
    inlines = [BatchItemInline]
