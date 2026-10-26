from django.urls import path
from . import views

urlpatterns = [
    path('', views.CouponListView.as_view(), name='coupon_list'),
    path('apply/', views.CouponApplyView.as_view(), name='coupon_apply'),
]
