from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Public auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),

    # Authenticated
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Admin only
    path('users/', views.AllUsersListView.as_view(), name='all_users_list'),
    path('users/<int:pk>/manage/', views.UserManageView.as_view(), name='user_manage'),
    path('staff/create/', views.StaffCreateView.as_view(), name='staff_create'),
    path('staff/', views.StaffListView.as_view(), name='staff_list'),
    path('delivery-partners/', views.DeliveryPartnerListView.as_view(), name='delivery_partner_list'),
]
