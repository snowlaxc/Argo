from .views import post_list_create, post_detail, delete_post, comments_list_create, user_detail, delete_comment, update_comment, notice_list_create, notice_detail, notice_comments_list_create  # post_detail 뷰 함수를 임포트합니다.
from django.urls import path, include
from . import views
from .download_file_view import *
from .download_file_view import download_file_view, download_notice_file

urlpatterns = [
    path('posts/', post_list_create, name='post_list_create'),
    path('notices/', notice_list_create, name='notice_list_create'),
    path('posts/<int:id>/', post_detail, name='post_detail'),
    path('posts/<int:id>/delete/', views.delete_post, name='delete_post'),
    path('notices/<int:id>/noticedelete/', views.delete_notice, name='delete_notice'),
    path('posts/<int:id>/comments/', views.comments_list_create, name='comments_list_create'),
    path('notices/<int:id>/comments/', views.notice_comments_list_create, name='notice_comments_list_create'),
    path('comments/<int:id>/delete/', views.delete_comment, name='delete_comment'),
    path('comments/<int:id>/update/', views.update_comment, name='update_comment'),
    path('notices/<int:id>/update/', views.update_notice_comment, name='update_notice_comment'),
    path('notices/<int:id>/delete/', views.delete_notice_comment, name='delete_notice_comment'),
    path('notices/<int:id>/', notice_detail, name='notice_detail'),
    path('user/detail/', user_detail, name='user_detail'),
    path('', views.getRoutes),
    path('password_reset/', include('django.contrib.auth.urls')),  # 패스워드 재설정
    
    path('post_uploads/<str:file_name>/', download_file_view, name='download_file_view'),
    path('notice_uploads/<str:file_name>/', download_notice_file, name='download_notice_file'),

]