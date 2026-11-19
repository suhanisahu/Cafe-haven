
import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

User = get_user_model()

@require_POST
def signup(request):
    try:
        data = json.loads(request.body)

        username = data.get("username", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not username or not email or not password:
            return JsonResponse(
                {"error": "Username, email, and password are required."},
                status=400,
            )

        if len(username) > 150:
            return JsonResponse(
                {"error": "Username must be 150 characters or fewer."},
                status=400,
            )

        if len(password) < 8:
            return JsonResponse(
                {"error": "Password must contain at least 8 characters."},
                status=400,
            )

        if User.objects.filter(username__iexact=username).exists():
            return JsonResponse(
                {"error": "This username is already taken."},
                status=400,
            )

        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse(
                {"error": "This email is already registered."},
                status=400,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        return JsonResponse(
            {
                "message": "Account created successfully.",
                "username": user.username,
            },
            status=201,
        )

    except (json.JSONDecodeError, TypeError):
        return JsonResponse(
            {"error": "Invalid request data."},
            status=400,
        )

@require_POST
def customer_login(request):
    try:
        data = json.loads(request.body)

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return JsonResponse(
                {"error": "Username and password are required."},
                status=400,
            )

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user is None:
            return JsonResponse(
                {"error": "Invalid username or password."},
                status=401,
            )

        if not user.is_active:
            return JsonResponse(
                {"error": "This account is inactive."},
                status=403,
            )

        login(request, user)

        return JsonResponse(
            {
                "message": "Login successful.",
                "username": user.username,
            }
        )

    except (json.JSONDecodeError, TypeError):
        return JsonResponse(
            {"error": "Invalid request data."},
            status=400,
        )
    
from django.views.decorators.http import require_GET


@require_POST
def admin_login(request):
    try:
        data = json.loads(request.body)

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return JsonResponse(
                {"error": "Username and password are required."},
                status=400,
            )

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user is None:
            return JsonResponse(
                {"error": "Invalid username or password."},
                status=401,
            )

        if not user.is_active:
            return JsonResponse(
                {"error": "This account is inactive."},
                status=403,
            )

        if not user.is_staff:
            return JsonResponse(
                {"error": "Admin access is restricted."},
                status=403,
            )

        login(request, user)

        return JsonResponse({
            "message": "Admin login successful.",
            "username": user.username,
            "is_staff": user.is_staff,
        })

    except (json.JSONDecodeError, TypeError):
        return JsonResponse(
            {"error": "Invalid request data."},
            status=400,
        )


@require_GET
def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
        })

    return JsonResponse({
        "authenticated": False,
        "is_staff": False,
    })
@csrf_exempt
@require_POST
def customer_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful."})
@ensure_csrf_cookie
@require_GET
def csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})

