from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from core.permissions import IsAdmin
from .serializers import (
    RegisterSerializer, StaffCreateSerializer, UserSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, UserManageSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Customer self-registration. Only creates 'customer' role."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Account created successfully!',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class StaffCreateView(generics.CreateAPIView):
    """Admin-only endpoint to create internal staff accounts."""
    serializer_class = StaffCreateSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': f'{user.get_role_display()} account created.',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Authenticated user's own profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserManageView(generics.UpdateAPIView):
    """Admin: manage user role and active status."""
    queryset = User.objects.all()
    serializer_class = UserManageSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        # Allow partial updates
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class AllUsersListView(generics.ListAPIView):
    """Admin: list all users."""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs.order_by('-date_joined', 'username')


class StaffListView(generics.ListAPIView):
    """Admin: list all internal staff members."""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        qs = User.objects.exclude(role='customer')
        if role:
            qs = qs.filter(role=role)
        return qs.order_by('role', 'username')


class DeliveryPartnerListView(generics.ListAPIView):
    """Admin: list delivery partners, filterable by availability."""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = User.objects.filter(role='delivery_partner')
        available = self.request.query_params.get('available')
        if available is not None:
            qs = qs.filter(is_available=available.lower() == 'true')
        return qs.order_by('username')


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"http://localhost:3000/reset-password?uid={uid}&token={token}"

            send_mail(
                subject='Reset Your Fresh Roots Password',
                message=f'Click the link to reset your password: {reset_url}',
                from_email='noreply@freshroots.com',
                recipient_list=[email],
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists

        return Response({'message': 'If an account with this email exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = request.data.get('uid')
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({'message': 'Password reset successfully!'})
            else:
                return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)
