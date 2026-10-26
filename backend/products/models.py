from django.db import models
from django.conf import settings
from django.utils.text import slugify
from datetime import date


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default='🥬')
    description = models.TextField(blank=True, default='')
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    Product listed on the platform.

    CRITICAL RULES:
    - Every product MUST have a farmer (F-ID) for traceability
    - Products are created by Content Managers, NOT by farmers
    - Visibility is controlled by is_visible flag
    - Stock is tracked in the warehouse app, not here
    """

    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('bunch', 'Bunch'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
        ('dozen', 'Dozen'),
        ('liter', 'Liter'),
    ]

    # Traceability — MANDATORY
    farmer = models.ForeignKey(
        'farmers.Farmer',
        on_delete=models.PROTECT,
        related_name='products',
        help_text='REQUIRED: Farmer/supplier who produced this product (F-ID).'
    )
    batch = models.ForeignKey(
        'procurement.ProcurementBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text='Procurement batch this product came from.'
    )

    # Product info
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    story = models.TextField(
        blank=True, default='',
        help_text='The story behind this product — origin, growing methods, etc.'
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name='products'
    )

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Selling price')
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text='Procurement cost (internal only).'
    )
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')

    # Media
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    # Product attributes
    harvest_date = models.DateField()
    origin_location = models.CharField(max_length=200)
    is_organic = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(
        default=False,
        help_text='Content Manager controls whether product appears on storefront.'
    )

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_products',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_visible', 'is_featured'], name='idx_product_visibility'),
            models.Index(fields=['category'], name='idx_product_category'),
            models.Index(fields=['farmer'], name='idx_product_farmer'),
            models.Index(fields=['harvest_date'], name='idx_product_harvest'),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def freshness_score(self):
        """Calculate freshness based on harvest date (0-100)."""
        days_since_harvest = (date.today() - self.harvest_date).days
        if days_since_harvest <= 0:
            return 100
        elif days_since_harvest <= 1:
            return 95
        elif days_since_harvest <= 3:
            return 80
        elif days_since_harvest <= 5:
            return 60
        elif days_since_harvest <= 7:
            return 40
        else:
            return max(10, 100 - (days_since_harvest * 10))

    @property
    def freshness_label(self):
        score = self.freshness_score
        if score >= 90:
            return 'Just Harvested'
        elif score >= 70:
            return 'Very Fresh'
        elif score >= 50:
            return 'Fresh'
        elif score >= 30:
            return 'Good'
        else:
            return 'Use Soon'

    @property
    def total_stock(self):
        """Aggregate stock across all warehouses."""
        from django.db.models import Sum
        result = self.inventory_items.aggregate(total=Sum('quantity'))
        return result['total'] or 0

    @property
    def available_stock(self):
        """Stock available for new orders."""
        from django.db.models import Sum, F
        result = self.inventory_items.aggregate(
            available=Sum(F('quantity') - F('reserved_quantity'))
        )
        return max(0, result['available'] or 0)

    @property
    def in_stock(self):
        return self.available_stock > 0
