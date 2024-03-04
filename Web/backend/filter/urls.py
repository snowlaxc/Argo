from django.urls import path, include
from . import views
from .views import GetAllResults, GetAllQuestions, GetUserData
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# router.register(r'chat-sessions', ChatSessionViewSet)

urlpatterns = [
    path('get_all_results/', GetAllResults.as_view(), name='get_all_results'),
    path('get_all_questions/', GetAllQuestions.as_view(), name='get_all_questions'),
    path('get_user_data/', GetUserData.as_view(), name='get_user_data'),
]