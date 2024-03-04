from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import NoticeComment, Post, Comment, FileModel, Notice, NoticeFile
from .serializer import NoticeCommentSerializer, PostSerializer, CommentSerializer, NoticeSerializer
from django.http import JsonResponse
from account.models import User
from django.db.models import Q
import logging
import json

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/noticeboard/posts/',
    ]
    return Response(routes)

# 공지사항 목록 조회 및 생성을 위한 뷰 함수
@api_view(['GET', 'POST'])
def notice_list_create(request):
    if request.method == 'POST' and (not request.user.is_authenticated or not request.user.is_admin):
        return Response({'detail': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        search_query = request.query_params.get('search', None) # 검색어 가져오기
        notices = Notice.objects.all()
        if search_query:
            notices = notices.filter(Q(title__icontains=search_query) | Q(content__icontains=search_query))
        # context 파라미터에 request를 전달하여 파일 URL 생성 시 필요한 request 정보를 제공
        serializer = NoticeSerializer(notices, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = NoticeSerializer(data=request.data, context={'request': request})
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # 유효성 검증 실패 로그 출력
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'POST'])
def post_list_create(request):
    if request.method == 'GET':
        search_query = request.query_params.get('search', None) # 검색어 가져오기
        posts = Post.objects.all()
        if search_query:
            posts = posts.filter(Q(title__icontains=search_query) | Q(content__icontains=search_query))
        serializer = PostSerializer(posts, many=True)
        
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save(user_no=request.user)
            files_data = request.FILES.getlist('file_field_name')
            files_names = request.data.getlist('file_name')
            # for file_data, file_name in zip(files_data, files_names):
            #     FileModel.objects.create(post_id=post, src=file_data, name=file_name)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    
@api_view(['GET', 'PUT', 'DELETE'])
def post_detail(request, id):
    post = get_object_or_404(Post, pk=id)
    if request.method == 'GET':
        serializer = PostSerializer(post)
        print(serializer.data)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # 파일 이름을 request에서 가져오기 (파일 업데이트를 위해 필요하다면)
        # 여기에 로직 추가
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['DELETE'])
def delete_post(request, id):
    # ID에 해당하는 게시물을 데이터베이스에서 찾습니다.
    post = get_object_or_404(Post, pk=id)

    # 게시물을 삭제합니다.
    post.delete()

    # 삭제가 성공적으로 이루어졌음을 응답으로 반환합니다.
    return JsonResponse({'message': '게시물이 성공적으로 삭제되었습니다.'})

    
@api_view(['DELETE'])
def delete_notice(request, id):
    # ID에 해당하는 게시물을 데이터베이스에서 찾습니다.
    notice = get_object_or_404(Notice, pk=id)

    # 게시물을 삭제합니다.
    notice.delete()

    # 삭제가 성공적으로 이루어졌음을 응답으로 반환합니다.
    return JsonResponse({'message': '게시물이 성공적으로 삭제되었습니다.'})


@api_view(['GET', 'POST'])
def comments_list_create(request, id):
    post = get_object_or_404(Post, pk=id)

    if request.method == 'GET':
        comments = Comment.objects.filter(post_id=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'detail': '로그인이 필요합니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CommentSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            # save() 호출 시 user_no에 request.user를 전달합니다.
            serializer.save(post_id=post, user_no=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
@api_view(['GET'])
def user_detail(request):
    # 인증된 사용자의 정보를 반환합니다.
    if request.user.is_authenticated:
        user = request.user
        # 사용자의 상세 정보를 담은 데이터, 필요한 정보만 선택하여 반환해야 합니다.
        user_data = {
            'id': user.id,  # 사용자의 아이디
            'user_no': user.user_no,  # 사용자의 고유 번호
            # 필요에 따라 추가 정보를 여기에 포함시킬 수 있습니다.
        }
        return Response(user_data)
    else:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)        
    

# 댓글 삭제
@api_view(['DELETE'])
def delete_comment(request, id):
    comment = get_object_or_404(Comment, pk=id)
    comment.delete()
    return Response({'message': '댓글이 성공적으로 삭제되었습니다.'})


# 댓글 삭제
@api_view(['DELETE'])
def delete_notice_comment(request, id):
    comment = get_object_or_404(NoticeComment, pk=id)
    comment.delete()
    return Response({'message': '댓글이 성공적으로 삭제되었습니다.'})


# 댓글 수정
@api_view(['PUT'])
def update_comment(request, id):
    comment = get_object_or_404(Comment, pk=id)
    serializer = CommentSerializer(comment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# 댓글 수정
@api_view(['PUT'])
def update_notice_comment(request, id):
    comment = get_object_or_404(NoticeComment, pk=id)
    serializer = NoticeCommentSerializer(comment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

# 로거 설정
logger = logging.getLogger(__name__)

    
@api_view(['GET', 'PUT', 'DELETE'])
def notice_detail(request, id):
    # ID에 해당하는 공지사항을 데이터베이스에서 찾습니다.
    notice = get_object_or_404(Notice.objects.prefetch_related('notice_files'), pk=id)
    if request.method == 'GET':
        serializer = NoticeSerializer(notice)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # PUT 요청인 경우, 공지사항을 수정합니다.
        # 파일 이름을 request에서 가져오기 (파일 업데이트를 위해 필요하다면)
        # 여기에 로직 추가
        serializer = NoticeSerializer(notice, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # DELETE 요청인 경우, 공지사항을 삭제합니다.
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    
    
@api_view(['GET', 'POST'])
def notice_comments_list_create(request, id):
    notice = get_object_or_404(Notice, pk=id)

    if request.method == 'GET':
        comments = NoticeComment.objects.filter(notice_id=notice)
        serializer = NoticeCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'detail': '로그인이 필요합니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = NoticeCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(notice_id=notice, user_no=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
