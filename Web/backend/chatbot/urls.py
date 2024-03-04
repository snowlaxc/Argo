from django.urls import path, include
from . import views
from .views import chatbot_response, ChatSessionViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'chat-sessions', ChatSessionViewSet)

urlpatterns = [
    path('', chatbot_response, name='chatbot_response'),
    path('api/', include(router.urls)),
]