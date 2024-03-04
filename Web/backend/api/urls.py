from noticeboard.views import post_list_create
from django.urls import path, include
from . import views
from .views import checkId, checkEmail, mailSend
from django.contrib.auth.views import PasswordChangeView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.views import PasswordResetView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('checkId/', checkId, name='checkId'),
    path('checkEmail/', checkEmail, name='checkEmail'),
    path('mailSend/', mailSend, name='mailSend'),
    path('', views.getRoutes),
    # path('password_change/', csrf_exempt(PasswordChangeView.as_view()), name='password_change'),
    path('password_reset/', csrf_exempt(PasswordResetView.as_view()), name='password_reset'), # 비번 재설정 이메일 요청
    path('password_change/', views.change_password, name='password_change'),
    path('users/<int:pk>/', views.delete_user, name='delete_user'),
]