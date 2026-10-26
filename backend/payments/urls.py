from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.InitiatePaymentView.as_view(), name='payment_initiate'),
    path('webhook/', views.PaymentWebhookView.as_view(), name='payment_webhook'),
    path('<int:pk>/confirm-cod/', views.ConfirmCODPaymentView.as_view(), name='confirm_cod'),
    path('order/<str:order_number>/', views.PaymentDetailView.as_view(), name='payment_detail'),
]
