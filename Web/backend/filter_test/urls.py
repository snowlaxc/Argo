from django.urls import path, include
from . import views
from .views import recommend_problems_view, feedback

urlpatterns = [
    path('recommend_problems_view/', recommend_problems_view, name='recommend_problems_view'),
    path('feedback/', feedback, name='feedback')
]