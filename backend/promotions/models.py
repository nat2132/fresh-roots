from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Coupon(models.Model):
    """
    Promotional coupon codes.
    Requirement 2.3 and 7.1 (Manages promotions).
    """

    DISCOUNT_TYPES = [
        ('percentage', 'Percentage (%)'),
        ('fixed', 'Fixed Amount (ETB)'),
    ]

    code = models.CharField(max_length=20, unique=True, db_index=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    min_purchase = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text='Minimum order subtotal required to apply this coupon.'
    )
    
    active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text='Total number of times this coupon can be used.')
    used_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.get_discount_type_display()})"

    @property
    def is_valid(self):
        now = timezone.now()
        if not self.active:
            return False
        if self.valid_from > now or self.valid_to < now:
            return False
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        return True

    def calculate_discount(self, subtotal):
        if subtotal < self.min_purchase:
            return 0
            
        if self.discount_type == 'percentage':
            discount = (self.discount_value / 100) * subtotal
        else:
            discount = self.discount_value
            
        return min(discount, subtotal)  # Discount cannot exceed subtotal
