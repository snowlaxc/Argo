from rest_framework import serializers
from .models import NoticeComment, Post, Comment, FileModel, Notice, NoticeFile
from account.models import User

class FileModelSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = FileModel
        fields = ['src', 'name', 'post_id']

    def get_src(self, obj):
        if hasattr(obj.src, 'url'):
            # request가 있는 경우 build_absolute_uri 사용, 없으면 url만 반환
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.src.url)
            else:
                return obj.src.url
        else:
            return None

class PostSerializer(serializers.ModelSerializer):
    files = FileModelSerializer(many=True, read_only=True)
    user_id = serializers.ReadOnlyField(source='user_no.id')

    class Meta:
        model = Post
        fields = ['post_id', 'title', 'content', 'user_no', 'timestamp', 'files', 'user_id']

    # 게시글 생성 시 파일 데이터와 파일 이름을 저장합니다.
    def create(self, validated_data):
        files_data = self.context['request'].FILES
        files_name = self.context['request'].data.getlist('file_name')  # 파일 이름을 위한 입력 필드 이름
        post = Post.objects.create(**validated_data)
        for file_data, file_name in zip(files_data.getlist('file_field_name'), files_name):  # 필드 이름에 맞게 조정하세요
            FileModel.objects.create(post_id=post, src=file_data, name=file_name)
        return post

class CommentSerializer(serializers.ModelSerializer):
    user_no = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    user_id = serializers.ReadOnlyField(source='user_no.id')

    class Meta:
        model = Comment
        fields = ['comm_no', 'post_id', 'user_no', 'user_id', 'content', 'timestamp']
        
class NoticeFileSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()

    class Meta:
        model = NoticeFile
        fields = ['src', 'name', 'notice_id']

    def get_src(self, obj):
        if hasattr(obj.src, 'url'):
            # request가 있는 경우 build_absolute_uri 사용, 없으면 url만 반환
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.src.url)
            else:
                return obj.src.url
        else:
            return None

class NoticeSerializer(serializers.ModelSerializer):
    notice_files = NoticeFileSerializer(many=True, read_only=True)
    user_id = serializers.ReadOnlyField(source='user_no.id', required=False, allow_null=True)


    class Meta:
        model = Notice
        fields = ['notice_id', 'title', 'content', 'user_no', 'timestamp', 'notice_files', 'user_id']

    def create(self, validated_data):
        # 게시글 생성 로직
        notice = Notice.objects.create(**validated_data)
        files_data = self.context['request'].FILES
        files_name = self.context['request'].data.getlist('file_name')
        for file_data, file_name in zip(files_data.getlist('file_field_name'), files_name):
            NoticeFile.objects.create(notice_id=notice, src=file_data, name=file_name)
        return notice

    def validate(self, data):
        """
        공지사항 데이터의 유효성 검증 로직입니다.
        예를 들어, 제목과 내용이 비어 있지 않은지, 파일 이름이 올바른 형식인지 등을 검증할 수 있습니다.
        """

        # 제목 필드 검증
        if not data.get('title'):
            raise serializers.ValidationError({"title": "제목은 비어 있을 수 없습니다."})

        # 내용 필드 검증
        if not data.get('content'):
            raise serializers.ValidationError({"content": "내용은 비어 있을 수 없습니다."})

        # 파일 이름 검증
        files_name = self.context['request'].data.get('file_name', [])
        if isinstance(files_name, str):
            files_name = [files_name]

        return data
class NoticeCommentSerializer(serializers.ModelSerializer):
    user_no = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    user_id = serializers.ReadOnlyField(source='user_no.id')

    class Meta:
        model = NoticeComment
        fields = ['comm_no', 'notice_id', 'user_no', 'user_id', 'content', 'timestamp']
