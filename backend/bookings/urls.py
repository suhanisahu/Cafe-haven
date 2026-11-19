
from django.urls import path
from . import views

from .views import (
    create_booking,
    list_bookings,
    cancel_booking,
    update_booking,
    my_bookings,
    admin_dashboard_stats,
    admin_all_bookings,
    admin_update_booking_status,
)

urlpatterns = [
    path("create/", create_booking, name="create_booking"),
    path("my/", my_bookings, name="my_bookings"),
    path("admin-stats/", admin_dashboard_stats, name="admin_dashboard_stats"),
    path("", list_bookings, name="list_bookings"),
    path(
        "<int:booking_id>/cancel/",
        cancel_booking,
        name="cancel_booking",
    ),
    path(
        "<int:booking_id>/update/",
        update_booking,
        name="update_booking",
    ),
    path("admin-all/", admin_all_bookings, name="admin_all_bookings"),
    path(
    "admin-update/<int:booking_id>/",
    admin_update_booking_status,
    name="admin_update_booking_status",
),
path(
    "demo-phonepe-payment/",
    views.demo_phonepe_payment,
    name="demo_phonepe_payment",
),
]
