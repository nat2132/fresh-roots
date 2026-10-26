from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'category', 'price', 'is_visible', 'is_featured', 'harvest_date']
    list_filter = ['is_visible', 'is_featured', 'is_organic', 'category']
    search_fields = ['name', 'farmer__farmer_code', 'farmer__full_name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
