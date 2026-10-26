from django.db import models
from django.conf import settings
from core.utils import generate_batch_number


class ProcurementBatch(models.Model):
    """
    Represents a batch of goods purchased from a farmer.

    Each batch is a single procurement event: the company buys X quantity
    of products from farmer Y on date Z. Batch numbers are used for
    full traceability from customer → product → batch → farmer.
    """

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Payment Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Fully Paid'),
    ]

    batch_number = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text='Unique batch ID, e.g. BAT-20260504-B2K9'
    )
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.PROTECT,
        related_name='procurement_batches',
    )
    purchased_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='procurement_purchases',
        help_text='Staff member who handled the procurement.'
    )
    purchase_date = models.DateField()
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(
        max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending'
    )
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'procurement_batches'
        ordering = ['-purchase_date']
        indexes = [
            models.Index(fields=['farmer', 'purchase_date'], name='idx_batch_farmer_date'),
            models.Index(fields=['payment_status'], name='idx_batch_payment'),
        ]

    def __str__(self):
        return f"{self.batch_number} — {self.farmer.full_name}"

    def save(self, *args, **kwargs):
        if not self.batch_number:
            self.batch_number = generate_batch_number()
        super().save(*args, **kwargs)


class BatchItem(models.Model):
    """Individual line item within a procurement batch."""

    QUALITY_CHOICES = [
        ('A', 'Grade A — Premium'),
        ('B', 'Grade B — Standard'),
        ('C', 'Grade C — Economy'),
    ]

    batch = models.ForeignKey(
        ProcurementBatch,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    quality_grade = models.CharField(max_length=1, choices=QUALITY_CHOICES, default='B')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'batch_items'

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.product_name}"

    @property
    def line_total(self):
        return self.quantity * self.unit_cost
