from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.ProductListView.as_view(), name='product_list'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured_products'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('<slug:slug>/traceability/', views.ProductTraceabilityView.as_view(), name='product_traceability'),

    # Content Manager
    path('manage/all/', views.ProductManageListCreateView.as_view(), name='product_manage_list'),
    path('manage/<slug:slug>/', views.ProductManageDetailView.as_view(), name='product_manage_detail'),
    path('manage/categories/', views.CategoryManageView.as_view(), name='category_manage'),
]
