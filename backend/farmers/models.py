from django.db import models
from django.conf import settings
from core.utils import generate_farmer_code


class Farmer(models.Model):
    """
    Farmer / Supplier entity.

    CRITICAL: Farmers are NOT platform users. They cannot log in.
    Farmers are registered only by Admin for traceability and accountability.
    Every product in the system MUST be linked to a Farmer via farmer_code (F-ID).
    """

    farmer_code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Unique Farmer ID (F-ID), e.g. F-00001'
    )
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, default='')
    location = models.CharField(max_length=300, help_text='Farm/supplier location')
    region = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    # Accountability
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='registered_farmers',
        limit_choices_to={'role': 'admin'},
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farmers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active'], name='idx_farmer_active'),
            models.Index(fields=['location'], name='idx_farmer_location'),
        ]

    def __str__(self):
        return f"{self.farmer_code} — {self.full_name}"

    def save(self, *args, **kwargs):
        if not self.farmer_code:
            self.farmer_code = generate_farmer_code()
        super().save(*args, **kwargs)

    @property
    def total_batches(self):
        return self.procurement_batches.count()

    @property
    def total_products(self):
        return self.products.count()
