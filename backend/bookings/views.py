
import json
from datetime import date

from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_http_methods
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import Booking


# -------------------------------
# BOOKING VALIDATION
# -------------------------------

def validate_booking_data(data):
    booking_date = data.get("date", "")

    try:
        selected_date = date.fromisoformat(booking_date)
    except (ValueError, TypeError):
        return "Please provide a valid booking date."

    if selected_date < date.today():
        return "Past dates are not allowed."

    raw_guests = data.get("guests")

    if isinstance(raw_guests, bool):
        return "Number of guests must be a whole number."

    try:
        guests = int(raw_guests)
    except (ValueError, TypeError, OverflowError):
        return "Number of guests must be a whole number."

    if str(raw_guests).strip() != str(guests):
        return "Number of guests must be a whole number."

    if not 1 <= guests <= 20:
        return "Number of guests must be between 1 and 20."

    if data.get("experience") not in dict(Booking.EXPERIENCE_CHOICES):
        return "Please select a valid dining experience."

    required_fields = ["full_name", "email", "phone", "time"]

    for field in required_fields:
        if not data.get(field):
            return f"{field.replace('_', ' ').title()} is required."

    return None


# -------------------------------
# PRICING
# -------------------------------

def pricing_response(booking):
    return {
        "base_price": str(booking.base_price),
        "gst_rate": "5%",
        "gst_amount": str(booking.gst_amount),
        "total_amount": str(booking.total_amount),
        "advance_amount": str(booking.advance_amount),
        "remaining_amount": str(
            booking.total_amount - booking.advance_amount
        ),
        "payment_status": booking.payment_status,
    }


# -------------------------------
# BOOKING EMAIL
# -------------------------------

def send_booking_confirmation_email(booking):
    subject = f"Cafe Haven - Booking Received #{booking.id}"

    message = f"""
Hello {booking.full_name},

Thank you for choosing Cafe Haven!

We have received your booking request.

Booking Details:
-------------------------
Booking ID: {booking.id}
Name: {booking.full_name}
Date: {booking.date}
Time: {booking.time}
Guests: {booking.guests}
Experience: {booking.get_experience_display()}

Total Amount: Rs. {booking.total_amount}
Advance Amount: Rs. {booking.advance_amount}

Your booking is currently awaiting payment confirmation.

We look forward to welcoming you!

Regards,
Cafe Haven Team
"""

    send_mail(
        subject,
        message,
        None,
        [booking.email],
        fail_silently=False,
    )


# -------------------------------
# CREATE BOOKING
# -------------------------------

@require_POST
def create_booking(request):
    try:
        data = json.loads(request.body)

        error = validate_booking_data(data)

        if error:
            return JsonResponse({"error": error}, status=400)

        booking = Booking.objects.create(
            customer=(
                request.user
                if request.user.is_authenticated
                else None
            ),
            full_name=data["full_name"],
            email=data["email"],
            phone=data["phone"],
            date=data["date"],
            time=data["time"],
            guests=int(data["guests"]),
            experience=data["experience"],
        )

        # Send booking email without interrupting booking creation
        try:
            send_booking_confirmation_email(booking)
        except Exception as email_error:
            print("Booking email failed:", email_error)

        return JsonResponse({
            "message": "Booking created successfully!",
            "booking_id": booking.id,
            "pricing": pricing_response(booking),
        }, status=201)

    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as error:
        return JsonResponse({"error": str(error)}, status=400)


# -------------------------------
# DEMO PHONEPE PAYMENT
# -------------------------------

@require_POST
def demo_phonepe_payment(request):
    try:
        data = json.loads(request.body)

        booking_id = data.get("booking_id")
        payment_result = data.get("payment_result")

        if payment_result not in ["success", "failed"]:
            return JsonResponse(
                {"error": "Invalid demo payment result."},
                status=400,
            )

        booking = get_object_or_404(Booking, id=booking_id)

        if booking.payment_status == "paid":
            return JsonResponse(
                {"error": "This booking is already paid."},
                status=400,
            )

        if payment_result == "success":
            booking.payment_status = "paid"
            booking.status = "confirmed"
            message = "Demo PhonePe payment successful!"
        else:
            booking.payment_status = "failed"
            message = "Demo PhonePe payment failed."

        booking.save(update_fields=["payment_status", "status"])

        return JsonResponse({
            "message": message,
            "booking_id": booking.id,
            "payment_status": booking.payment_status,
            "booking_status": booking.status,
            "amount": str(booking.advance_amount),
            "demo": True,
        })

    except (json.JSONDecodeError, TypeError, ValueError):
        return JsonResponse(
            {"error": "Invalid payment request."},
            status=400,
        )


# -------------------------------
# LIST ALL BOOKINGS
# -------------------------------

@require_http_methods(["GET"])
def list_bookings(request):
    bookings = Booking.objects.all().order_by("-created_at")
    booking_data = []

    for booking in bookings:
        booking_data.append({
            "id": booking.id,
            "full_name": booking.full_name,
            "email": booking.email,
            "phone": booking.phone,
            "date": booking.date.isoformat(),
            "time": booking.time.strftime("%H:%M"),
            "guests": booking.guests,
            "experience": booking.experience,
            "status": booking.status,
            "created_at": booking.created_at.isoformat(),
            "pricing": pricing_response(booking),
        })

    return JsonResponse({"bookings": booking_data})


# -------------------------------
# MY BOOKINGS
# -------------------------------

@require_http_methods(["GET"])
def my_bookings(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please log in to view your bookings."},
            status=401,
        )

    bookings = Booking.objects.filter(
        customer=request.user
    ).order_by("-created_at")

    booking_data = []

    for booking in bookings:
        booking_data.append({
            "id": booking.id,
            "full_name": booking.full_name,
            "email": booking.email,
            "phone": booking.phone,
            "date": booking.date.isoformat(),
            "time": booking.time.strftime("%H:%M"),
            "guests": booking.guests,
            "experience": booking.experience,
            "status": booking.status,
            "payment_status": booking.payment_status,
            "created_at": booking.created_at.isoformat(),
            "pricing": pricing_response(booking),
        })

    return JsonResponse({"bookings": booking_data})


# -------------------------------
# CANCEL BOOKING
# -------------------------------

@csrf_exempt
@require_POST
def cancel_booking(request, booking_id):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please log in to cancel a booking."},
            status=401,
        )

    try:
        booking = Booking.objects.get(
            id=booking_id,
            customer=request.user,
        )

        if booking.status == "cancelled":
            return JsonResponse(
                {"message": "Booking is already cancelled."}
            )

        booking.status = "cancelled"
        booking.save(update_fields=["status"])

        return JsonResponse({
            "message": "Booking cancelled successfully.",
            "booking_id": booking.id,
            "status": booking.status,
        })

    except Booking.DoesNotExist:
        return JsonResponse(
            {
                "error": (
                    "Booking not found or you do not have permission "
                    "to cancel it."
                )
            },
            status=404,
        )


# -------------------------------
# UPDATE BOOKING
# -------------------------------

@csrf_exempt
@require_http_methods(["PUT"])
def update_booking(request, booking_id):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please log in to update a booking."},
            status=401,
        )

    try:
        booking = Booking.objects.get(
            id=booking_id,
            customer=request.user,
        )

        data = json.loads(request.body)

        error = validate_booking_data(data)

        if error:
            return JsonResponse({"error": error}, status=400)

        booking.full_name = data["full_name"]
        booking.email = data["email"]
        booking.phone = data["phone"]
        booking.date = data["date"]
        booking.time = data["time"]
        booking.guests = int(data["guests"])
        booking.experience = data["experience"]

        booking.save()

        return JsonResponse({
            "message": "Booking updated successfully.",
            "booking_id": booking.id,
            "pricing": pricing_response(booking),
        })

    except Booking.DoesNotExist:
        return JsonResponse(
            {
                "error": (
                    "Booking not found or you do not have "
                    "permission to update it."
                )
            },
            status=404,
        )

    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as error:
        return JsonResponse({"error": str(error)}, status=400)


# -------------------------------
# ADMIN DASHBOARD STATS
# -------------------------------

@require_http_methods(["GET"])
def admin_dashboard_stats(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse(
            {"error": "Admin access required."},
            status=403,
        )

    stats = Booking.objects.aggregate(
        total=Count("id"),
        pending=Count("id", filter=Q(status="pending")),
        confirmed=Count("id", filter=Q(status="confirmed")),
        cancelled=Count("id", filter=Q(status="cancelled")),
    )

    return JsonResponse(stats)


# -------------------------------
# ADMIN ALL BOOKINGS
# -------------------------------

@require_http_methods(["GET"])
def admin_all_bookings(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse(
            {"error": "Admin access required."},
            status=403,
        )

    bookings = Booking.objects.all().order_by("-created_at")
    booking_data = []

    for booking in bookings:
        booking_data.append({
            "id": booking.id,
            "full_name": booking.full_name,
            "email": booking.email,
            "phone": booking.phone,
            "date": booking.date.isoformat(),
            "time": booking.time.strftime("%H:%M"),
            "guests": booking.guests,
            "experience": booking.experience,
            "status": booking.status,
            "pricing": pricing_response(booking),
        })

    return JsonResponse({"bookings": booking_data})


# -------------------------------
# ADMIN UPDATE BOOKING STATUS
# -------------------------------

@require_POST
def admin_update_booking_status(request, booking_id):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse(
            {"error": "Admin access required."},
            status=403,
        )

    try:
        data = json.loads(request.body)
        new_status = data.get("status")

        if new_status not in ["confirmed", "cancelled"]:
            return JsonResponse(
                {"error": "Invalid booking status."},
                status=400,
            )

        booking = Booking.objects.get(id=booking_id)
        booking.status = new_status
        booking.save(update_fields=["status"])

        return JsonResponse({
            "message": "Booking status updated successfully.",
            "booking_id": booking.id,
            "status": booking.status,
        })

    except Booking.DoesNotExist:
        return JsonResponse(
            {"error": "Booking not found."},
            status=404,
        )

    except (json.JSONDecodeError, TypeError):
        return JsonResponse(
            {"error": "Invalid request data."},
            status=400,
        )
