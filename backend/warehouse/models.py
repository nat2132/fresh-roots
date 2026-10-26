from django.db import models
from django.conf import settings


class Warehouse(models.Model):
    """Company-controlled warehouse for product storage."""

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True, help_text='Short code, e.g. WH-01')
    location = models.CharField(max_length=300)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_warehouses',
        limit_choices_to={'role': 'warehouse_manager'},
    )
    capacity_description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'warehouses'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} — {self.name}"


class InventoryItem(models.Model):
    """
    Tracks stock quantity per product per warehouse per batch.

    CRITICAL CONSTRAINT: quantity must NEVER go negative.
    Enforced at DB level with CheckConstraint and at application
    level with select_for_update() locking.
    """

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='inventory_items',
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='inventory_items',
    )
    batch = models.ForeignKey(
        'procurement.ProcurementBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_items',
    )
    quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(
        default=0,
        help_text='Quantity reserved for confirmed but not yet packed orders.'
    )
    storage_location = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Physical location, e.g. "Aisle 3, Shelf B"'
    )
    received_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_items'
        unique_together = ('product', 'warehouse', 'batch')
        constraints = [
            models.CheckConstraint(
                condition=models.Q(quantity__gte=0),
                name='stock_never_negative'
            ),
            models.CheckConstraint(
                condition=models.Q(reserved_quantity__gte=0),
                name='reserved_never_negative'
            ),
        ]
        indexes = [
            models.Index(fields=['product', 'warehouse'], name='idx_inv_product_wh'),
            models.Index(fields=['quantity'], name='idx_inv_quantity'),
        ]

    def __str__(self):
        return f"{self.product.name} @ {self.warehouse.code}: {self.quantity}"

    @property
    def available_quantity(self):
        """Stock available for new orders (total minus reserved)."""
        return max(0, self.quantity - self.reserved_quantity)


class QualityCheck(models.Model):
    """Quality inspection record for received goods."""

    RESULT_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('conditional', 'Conditional Pass'),
    ]

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='quality_checks',
    )
    checked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'role__in': ['warehouse_manager', 'admin']},
    )
    result = models.CharField(max_length=15, choices=RESULT_CHOICES)
    temperature = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text='Storage temperature at time of check (°C).'
    )
    notes = models.TextField(blank=True, default='')
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quality_checks'
        ordering = ['-checked_at']

    def __str__(self):
        return f"QC: {self.result} — {self.inventory_item}"


class StockMovement(models.Model):
    """Audit log for all inventory changes."""

    MOVEMENT_TYPES = [
        ('received', 'Received from Procurement'),
        ('reserved', 'Reserved for Order'),
        ('unreserved', 'Unreserved (Order Cancelled)'),
        ('packed', 'Packed for Delivery'),
        ('adjustment', 'Manual Adjustment'),
        ('damaged', 'Damaged/Expired'),
    ]

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='movements',
    )
    movement_type = models.CharField(max_length=15, choices=MOVEMENT_TYPES)
    quantity_change = models.IntegerField(help_text='Positive for additions, negative for deductions.')
    quantity_after = models.PositiveIntegerField()
    reference = models.CharField(
        max_length=50, blank=True, default='',
        help_text='Order number or batch number reference.'
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['movement_type'], name='idx_movement_type'),
            models.Index(fields=['reference'], name='idx_movement_ref'),
        ]

    def __str__(self):
        return f"{self.movement_type}: {self.quantity_change} on {self.inventory_item}"
