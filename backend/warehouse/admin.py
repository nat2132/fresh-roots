from django.contrib import admin
from .models import Warehouse, InventoryItem, QualityCheck, StockMovement


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'location', 'manager', 'is_active']
    list_filter = ['is_active']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'warehouse', 'quantity', 'reserved_quantity', 'storage_location']
    list_filter = ['warehouse']
    search_fields = ['product__name']


@admin.register(QualityCheck)
class QualityCheckAdmin(admin.ModelAdmin):
    list_display = ['inventory_item', 'result', 'checked_by', 'checked_at']
    list_filter = ['result']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['inventory_item', 'movement_type', 'quantity_change', 'reference', 'created_at']
    list_filter = ['movement_type']
    readonly_fields = ['created_at']
