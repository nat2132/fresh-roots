from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Customer self-registration serializer."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'first_name', 'last_name', 'phone', 'address', 'city']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        # Customers can only self-register as 'customer'
        validated_data['role'] = 'customer'
        user = User.objects.create_user(**validated_data)
        return user


class StaffCreateSerializer(serializers.ModelSerializer):
    """Admin-only serializer for creating staff/delivery accounts."""
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name',
                  'phone', 'role', 'vehicle_type']

    def validate_role(self, value):
        if value == 'customer':
            raise serializers.ValidationError("Use the registration endpoint for customers.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """General user profile serializer."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'address', 'city', 'avatar',
                  'is_available', 'vehicle_type', 'is_active', 'date_joined']
        read_only_fields = ['id', 'role', 'date_joined']


class UserManageSerializer(serializers.ModelSerializer):
    """Admin serializer to change role and active status of any user."""
    class Meta:
        model = User
        fields = ['role', 'is_active']


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for embedding in other responses."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role']
        read_only_fields = fields


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
