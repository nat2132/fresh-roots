from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """
    Customer feedback for a completed order.
    Requirement 2.2 and 7.8 (Feedback System).
    """

    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='review',
        help_text='Feedback is linked to a specific completed order.'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5 stars.'
    )
    comment = models.TextField(blank=True, default='')
    
    # Optional image for quality feedback
    image = models.ImageField(upload_to='reviews/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['rating'], name='idx_review_rating'),
            models.Index(fields=['created_at'], name='idx_review_created'),
        ]

    def __str__(self):
        return f"Review for {self.order.order_number} by {self.user.username} ({self.rating}/5)"
