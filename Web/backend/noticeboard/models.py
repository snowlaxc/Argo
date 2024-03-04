from django.db import models
from django.conf import settings

class Post(models.Model):
    post_id=models.AutoField(primary_key=True)
    user_no = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# FileModel을 새로운 사양에 맞게 재정의합니다.
class FileModel(models.Model):
    post_id = models.ForeignKey(Post, related_name='files', on_delete=models.CASCADE)
    src = models.FileField(upload_to='uploads/')  # 실제 파일
    name = models.CharField(max_length=255)  # 사용자가 업로드한 파일의 이름

    def __str__(self):
        return f"{self.board_no.title}_{self.name}"

class Comment(models.Model):
    comm_no = models.AutoField(primary_key=True)
    post_id = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    user_no = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.CASCADE)
    content = models.CharField(max_length=45)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content

# 공지사항을 위한 새로운 모델
class Notice(models.Model):
    notice_id = models.AutoField(primary_key=True)
    user_no = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
# 공지사항과 관련된 파일을 위한 새로운 모델
class NoticeFile(models.Model):
    notice_id = models.ForeignKey(Notice, related_name='notice_files', on_delete=models.CASCADE)
    src = models.FileField(upload_to='notice_uploads/')  # 실제 파일
    name = models.CharField(max_length=255)  # 사용자가 업로드한 파일의 이름

    def __str__(self):
        return f"{self.notice_no.title}_{self.name}"   
     
class NoticeComment(models.Model):
    comm_no = models.AutoField(primary_key=True)
    notice_id = models.ForeignKey(Notice, related_name='comments', on_delete=models.CASCADE)
    user_no = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.CASCADE)
    content = models.CharField(max_length=45)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content
