
from django.contrib import admin
from .models import Booking


@admin.action(description="Confirm selected bookings")
def confirm_bookings(modeladmin, request, queryset):
    queryset.update(status="confirmed")


@admin.action(description="Cancel selected bookings")
def cancel_bookings(modeladmin, request, queryset):
    queryset.update(status="cancelled")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
        "phone",
        "date",
        "time",
        "guests",
        "experience",
        "status",
    )

    list_filter = ("status", "experience", "date")
    search_fields = ("full_name", "email", "phone")
    ordering = ("-created_at",)

    actions = [confirm_bookings, cancel_bookings]
