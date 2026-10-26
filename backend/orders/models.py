from django.db import models
from django.conf import settings
from core.utils import generate_order_number, generate_verification_code


class Order(models.Model):
    """
    Order with full supply-chain lifecycle.

    CRITICAL RULES:
    - Orders follow strict status transitions (state machine)
    - Every order gets a unique verification_code for delivery confirmation
    - COD payments confirmed ONLY after delivery verification
    - Digital payments must be confirmed BEFORE processing
    - System completes ONLY after customer confirms receipt
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('packed', 'Packed'),
        ('assigned', 'Assigned to Delivery'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered (Verified)'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('digital', 'Digital Payment'),
    ]

    # Allowed status transitions — enforced in business logic
    ALLOWED_TRANSITIONS = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['paid', 'processing', 'cancelled'],  # 'processing' for COD
        'paid': ['processing'],
        'processing': ['packed', 'cancelled'],
        'packed': ['assigned'],
        'assigned': ['out_for_delivery'],
        'out_for_delivery': ['delivered'],
        'delivered': ['completed'],
    }

    order_number = models.CharField(
        max_length=20, unique=True, db_index=True,
        help_text='Unique order ID, e.g. ORD-20260504-A3X7'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
        limit_choices_to={'role': 'customer'},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)

    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Delivery info
    delivery_address = models.TextField()
    delivery_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_phone = models.CharField(max_length=15, blank=True, default='')
    
    # Promotions
    coupon = models.ForeignKey(
        'promotions.Coupon',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Verification — customer must provide this code to delivery partner
    verification_code = models.CharField(
        max_length=6,
        help_text='6-digit code sent to customer for delivery verification.'
    )

    notes = models.TextField(blank=True, default='')

    # Warehouse assignment
    warehouse = models.ForeignKey(
        'warehouse.Warehouse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status'], name='idx_order_user_status'),
            models.Index(fields=['status'], name='idx_order_status'),
            models.Index(fields=['created_at'], name='idx_order_created'),
        ]

    def __str__(self):
        return f"Order {self.order_number} — {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        if not self.verification_code:
            self.verification_code = generate_verification_code()
        super().save(*args, **kwargs)

    def can_transition_to(self, new_status):
        """Check if status transition is allowed."""
        allowed = self.ALLOWED_TRANSITIONS.get(self.status, [])
        return new_status in allowed

    def transition_to(self, new_status, changed_by=None, note=''):
        """
        Perform a status transition with validation and logging.
        Raises ValueError if transition is not allowed.
        """
        if not self.can_transition_to(new_status):
            raise ValueError(
                f"Cannot transition from '{self.status}' to '{new_status}'. "
                f"Allowed: {self.ALLOWED_TRANSITIONS.get(self.status, [])}"
            )

        old_status = self.status
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])

        # Log the transition
        OrderStatusLog.objects.create(
            order=self,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            note=note,
        )

    @property
    def status_step(self):
        """Return numerical step for timeline visualization."""
        steps = ['pending', 'confirmed', 'paid', 'processing', 'packed',
                 'assigned', 'out_for_delivery', 'delivered', 'completed']
        if self.status in steps:
            return steps.index(self.status)
        return -1  # cancelled


class OrderItem(models.Model):
    """Line item in an order with traceability snapshot."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    farmer_code = models.CharField(
        max_length=20, blank=True, default='',
        help_text='Snapshot of farmer code at time of order for traceability.'
    )
    batch_number = models.CharField(
        max_length=30, blank=True, default='',
        help_text='Snapshot of batch number at time of order.'
    )
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, default='kg')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    @property
    def subtotal(self):
        return self.price * self.quantity


class OrderStatusLog(models.Model):
    """Audit log for every order status change."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_logs')
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_logs'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['order', 'created_at'], name='idx_status_log_order'),
        ]

    def __str__(self):
        return f"{self.order.order_number}: {self.from_status} → {self.to_status}"
