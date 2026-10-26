"""
Role-Based Access Control permissions for Fresh Roots.

Permission hierarchy:
- Admin: Full system access
- Content Manager: Product/category management
- Warehouse Manager: Inventory/quality operations
- Delivery Partner: Delivery operations
- Customer: Browse, order, track
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only users with 'admin' role."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsAdminOrReadOnly(BasePermission):
    """Admin for writes, anyone for reads."""

    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsContentManager(BasePermission):
    """Content managers and admins can manage products."""
    message = 'Content Manager access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'content_manager')
        )


class IsWarehouseManager(BasePermission):
    """Warehouse managers and admins can manage inventory."""
    message = 'Warehouse Manager access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'warehouse_manager')
        )


class IsDeliveryPartner(BasePermission):
    """Only delivery partners."""
    message = 'Delivery Partner access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'delivery_partner'
        )


class IsCustomer(BasePermission):
    """Only customers."""
    message = 'Customer access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'customer'
        )


class IsStaff(BasePermission):
    """Any internal staff member (not customer, not delivery)."""
    message = 'Staff access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'content_manager', 'warehouse_manager')
        )


class IsOwnerOrAdmin(BasePermission):
    """Object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.user == request.user
