
from django.urls import path
from . import views
from .views import csrf_token

urlpatterns = [
    path("signup/", views.signup, name="signup"),
    path("login/", views.customer_login, name="customer_login"),
    path("admin-login/", views.admin_login, name="admin_login"),
    path("me/", views.current_user, name="current_user"),
    path("logout/", views.customer_logout, name="customer_logout"),
    path("csrf/", csrf_token, name="csrf_token"),
]
