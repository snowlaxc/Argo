from django.urls import path, include
from .views import *
from .view_comm import *

app_name = "learn"

urlpatterns = [
    path('communication/study/', chatbot_response1, name='communication_study'),
    path('communication/study/first/', chatbot_response1_first, name='communication_study_first'),
    path('communication/study/check/', check_guideline, name='check_guideline'),
    path('communication/label/', labeling_7cs, name='communication_labeling'),
    path('communication/save/', comm_save, name = 'communication_save'),
    path('communication/history/', comm_view_history, name = 'communication_history'),
    path('communication/history/<int:no>/', comm_history_detail, name = 'communication_history_detail'),
    path('communication/score/', comm_score, name = 'communication_score'),

    path('wronglist/', wrong_question_list, name='wrong_question_list'),
    path('getQuestion/', give_question, name='give_question'),
    path('insertResult/', insertResult, name='insertResult'),
    path('recommendation/', recommendation, name='recommendation'),
    path('score/', score, name='score'),
    path('searchList/', search_list, name='search_list'),
    path('wrongQuestion/', get_wrong_question, name='get_wrong_question'),
    path('getAvgScore/', get_avg_score, name='get_avg_score'),
    
    path('check_result/', check_result, name='check_result'),
]