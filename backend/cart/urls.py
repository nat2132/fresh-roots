from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.CartAddItemView.as_view(), name='cart_add'),
    path('item/<int:item_id>/', views.CartUpdateItemView.as_view(), name='cart_update_item'),
]
