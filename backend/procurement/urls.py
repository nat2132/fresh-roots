from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProcurementBatchListCreateView.as_view(), name='batch_list_create'),
    path('<str:batch_number>/', views.ProcurementBatchDetailView.as_view(), name='batch_detail'),
]
