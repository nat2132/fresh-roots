from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for the Fresh Roots supply chain platform.

    Roles:
    - admin: Full system control
    - content_manager: Product/category management, pricing
    - warehouse_manager: Inventory, quality checks, order processing
    - delivery_partner: Delivery execution and verification
    - customer: Browse, order, track, receive
    """

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('content_manager', 'Content Manager'),
        ('warehouse_manager', 'Warehouse Manager'),
        ('delivery_partner', 'Delivery Partner'),
        ('customer', 'Customer'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True, default='')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Delivery partner specific
    is_available = models.BooleanField(
        default=True,
        help_text='Whether the delivery partner is available for new assignments.'
    )
    vehicle_type = models.CharField(max_length=50, blank=True, default='',
                                     help_text='Delivery partner vehicle type.')

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role'], name='idx_user_role'),
            models.Index(fields=['role', 'is_available'], name='idx_delivery_available'),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_staff_role(self):
        """Check if user has any internal staff role."""
        return self.role in ('admin', 'content_manager', 'warehouse_manager')

    @property
    def is_internal(self):
        """Check if user is internal (staff + delivery)."""
        return self.role != 'customer'
