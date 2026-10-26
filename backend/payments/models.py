from django.db import models
from django.conf import settings


class Payment(models.Model):
    """
    Payment tracking for orders.

    RULES:
    - Digital payments: must be confirmed BEFORE order enters 'processing'
    - COD payments: confirmed ONLY AFTER delivery partner enters verification code
    - Refunds tracked with 'refunded' status
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('digital', 'Digital Payment'),
    ]

    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payment',
    )
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    # Digital payment fields
    transaction_id = models.CharField(max_length=100, blank=True, default='')
    payment_provider = models.CharField(max_length=50, blank=True, default='',
                                         help_text='e.g., stripe, chapa, telebirr')
    payment_reference = models.CharField(max_length=200, blank=True, default='')

    # COD fields
    collected_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Actual amount collected by delivery partner (COD).'
    )

    # Timestamps and audit
    paid_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_payments',
    )
    refund_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['status'], name='idx_payment_status'),
            models.Index(fields=['method'], name='idx_payment_method'),
        ]

    def __str__(self):
        return f"Payment {self.id} — {self.order.order_number} ({self.status})"
