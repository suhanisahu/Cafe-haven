
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import models


class Booking(models.Model):

    EXPERIENCE_CHOICES = [
        ("regular", "Regular Dining"),
        ("candle", "Candle Light Dinner"),
        ("family", "Family Dinner"),
        ("theatre", "Private Theatre"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    EXPERIENCE_PRICES = {
        "candle": Decimal("5999.00"),
        "family": Decimal("6999.00"),
        "theatre": Decimal("7999.00"),
        "regular": Decimal("0.00"),
    }

    GST_RATE = Decimal("0.05")

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    date = models.DateField()
    time = models.TimeField()
    guests = models.PositiveIntegerField()

    experience = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    gst_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    advance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_pricing(self):
        self.base_price = self.EXPERIENCE_PRICES.get(
            self.experience, Decimal("0.00")
        )

        self.gst_amount = (
            self.base_price * self.GST_RATE
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        self.total_amount = self.base_price + self.gst_amount

        self.advance_amount = (
            self.total_amount / Decimal("2")
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def save(self, *args, **kwargs):
        self.calculate_pricing()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name
