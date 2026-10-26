from django.contrib import admin
from .models import Farmer


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['farmer_code', 'full_name', 'phone', 'location', 'is_active', 'created_at']
    list_filter = ['is_active', 'region']
    search_fields = ['farmer_code', 'full_name', 'phone']
    readonly_fields = ['farmer_code', 'created_at', 'updated_at']
