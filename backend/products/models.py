from django.db import models
from django.conf import settings
from django.utils.text import slugify
from datetime import date


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default='🥬')
    description = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('bunch', 'Bunch'),
        ('piece', 'Piece'),
        ('pack', 'Pack'),
        ('dozen', 'Dozen'),
    ]

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    story = models.TextField(blank=True, default='',
                             help_text='The story behind this product — who grew it, how, etc.')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    stock_quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    harvest_date = models.DateField()
    origin_location = models.CharField(max_length=200)
    is_organic = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

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
    def in_stock(self):
        return self.stock_quantity > 0
