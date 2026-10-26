from django.db import models
from django.conf import settings


class Delivery(models.Model):
    """
    Delivery assignment and tracking.

    Flow: Assigned → Picked Up → In Transit → Delivered → Verified
    Verification requires the delivery partner to enter the order's
    verification code, which the customer received.
    """

    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up from Warehouse'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('verified', 'Verified by Customer'),
        ('failed', 'Failed'),
    ]

    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='delivery',
    )
    partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deliveries',
        limit_choices_to={'role': 'delivery_partner'},
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='assigned')

    # Timestamps
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)

    # Verification
    verification_code_entered = models.CharField(
        max_length=6, blank=True, default='',
        help_text='Code entered by delivery partner at delivery.'
    )
    is_verified = models.BooleanField(default=False)

    # Proof of delivery
    proof_of_delivery = models.ImageField(
        upload_to='delivery_proofs/', blank=True, null=True,
        help_text='Photo proof of delivery.'
    )
    recipient_name = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Name of person who received the delivery.'
    )

    notes = models.TextField(blank=True, default='')
    failure_reason = models.TextField(blank=True, default='')
    assigned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deliveries'
        verbose_name_plural = 'deliveries'
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['partner', 'status'], name='idx_delivery_partner'),
            models.Index(fields=['status'], name='idx_delivery_status'),
        ]

    def __str__(self):
        return f"Delivery for {self.order.order_number} — {self.status}"

    def verify_code(self, code):
        """Verify delivery code against order's verification code."""
        return code == self.order.verification_code


class DeliveryLocationLog(models.Model):
    """GPS tracking log for delivery in transit."""
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='locations',
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy = models.FloatField(null=True, blank=True, help_text='GPS accuracy in meters.')
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'delivery_location_logs'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['delivery', 'recorded_at'], name='idx_location_delivery'),
        ]

    def __str__(self):
        return f"Location {self.latitude},{self.longitude} at {self.recorded_at}"
