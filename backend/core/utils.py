"""
Shared utility functions for Fresh Roots platform.
"""

import random
import string
import uuid
from datetime import date


def generate_farmer_code():
    """Generate unique Farmer Code (F-ID) like F-00001."""
    from farmers.models import Farmer
    last = Farmer.objects.order_by('-id').first()
    next_num = (last.id + 1) if last else 1
    return f"F-{next_num:05d}"


def generate_order_number():
    """Generate unique order number like ORD-20260504-A3X7."""
    today = date.today().strftime('%Y%m%d')
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{today}-{suffix}"


def generate_batch_number():
    """Generate unique batch number like BAT-20260504-B2K9."""
    today = date.today().strftime('%Y%m%d')
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"BAT-{today}-{suffix}"


def generate_verification_code():
    """Generate 6-digit verification code for order delivery."""
    return ''.join(random.choices(string.digits, k=6))
