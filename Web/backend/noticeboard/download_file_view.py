from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from urllib.parse import unquote
import os


def download_file_view(request, file_name):
    decoded_file_name = unquote(file_name)  # 파일명 디코딩
    file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', decoded_file_name)
    print(f"Download file path: {file_path}")  # 파일 경로 출력

    if os.path.exists(file_path):
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
    else:
        print("File not found.")  # 파일이 없을 경우 메시지 출력
        return HttpResponse(status=404)

def download_notice_file(request, file_name):
    decoded_file_name = unquote(file_name)  # 파일명 디코딩
    file_path = os.path.join(settings.MEDIA_ROOT, 'notice_uploads', decoded_file_name)
    print(f"Download notice file path: {file_path}")  # 파일 경로 출력

    if os.path.exists(file_path):
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
    else:
        print("Notice file not found.")  # 파일이 없을 경우 메시지 출력
        return HttpResponse(status=404)