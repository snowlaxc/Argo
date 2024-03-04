from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
# from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model
# 올바른 임포트:
from noticeboard.models import Post
from noticeboard.serializer import PostSerializer
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage
from account.models import User


# Create your views here.

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/password_change/'
    ]
    return Response(routes)



from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db import IntegrityError
import json
from smtplib import SMTPException

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        try:
            text = request.POST.get('text')
            data = f'Congratulation your API just responded to POST request with text: {text}'
            return Response({'response': data}, status=status.HTTP_200_OK)
        except IntegrityError:
            # 중복된 이메일이 발생한 경우
            return JsonResponse({'error': 'Email is already taken'}, status=400)
    return Response({}, status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated]) # 이거뭐야 누구야
# @csrf_exempt

@csrf_exempt
def checkId(request):
    try:
        # 아이디 가져오기
        data = json.loads(request.body)
        user_id = data.get('id')
        
        # 아이디 중복 체크 로직을 수정
        is_duplicate = User.objects.filter(id=user_id).exists()

        return JsonResponse({'isDuplicate': is_duplicate})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def checkEmail(request):
    try:
        # 이메일 가져오기
        data = json.loads(request.body)
        user_email = data.get('email')
        
        # 이메일 중복 체크 로직을 수정
        is_duplicate = User.objects.filter(email=user_email).exists()

        return JsonResponse({'isDuplicate': is_duplicate})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
def mailSend(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_email = data.get('email')
        code = generate_random_code(6)

        subject = '[ARGO] 인증번호를 입력해주세요.' # 타이틀
        message = f'이메일 인증번호: {code}\n인증 창에 입력하세요.' # 본문 내용
        from_email = "ARGO"    # 발신할 이메일 주소
        to = [user_email]   # 수신할 이메일 주소
        print(user_email)
        
        try:
            EmailMessage(subject=subject, body=message, to=to, from_email=from_email).send()
            return JsonResponse({'code': code})
        except SMTPException as e:
            return JsonResponse({'error': str(e)}, status=500)
    
import random
import string

def generate_random_code(length):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = json.loads(request.body)
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    confirm_new_password = data.get('confirm_new_password')

    if not check_password(old_password, user.password):
        return JsonResponse({'error': '현재 비밀번호가 일치하지 않습니다.'}, status=400)

    # 새 비밀번호와 확인된 새 비밀번호가 일치하는지 확인
    if new_password != confirm_new_password:
        return JsonResponse({'error': '새 비밀번호와 확인된 새 비밀번호가 일치하지 않습니다.'}, status=400)

    # 새 비밀번호를 설정하고 저장
    user.set_password(new_password)
    user.save()
    return JsonResponse({'success': '비밀번호가 변경되었습니다.'}, status=200)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        if request.user == user:
            user.delete()
            return Response({'message': '회원 탈퇴가 완료되었습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    except User.DoesNotExist:
        return Response({'error': '사용자가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)