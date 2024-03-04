from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework import viewsets
from .models import ChatSession
from .serializers import ChatSessionSerializer
from rest_framework.response import Response
from rest_framework import status
# from django.contrib.auth import get_user_model
from account.models import User
from .models import ChatSession

import json
import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from account.models import User
from openai import OpenAI

from dotenv import load_dotenv
load_dotenv()

# ChatSessionViewSet 정의
class ChatSessionViewSet(viewsets.ModelViewSet):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
        
    def perform_create(self, serializer):
        user_id_str = self.request.data.get('user_no')
        session_title = self.request.data.get('session_title')
        chat_content = self.request.data.get('chat_content')
        try:
            user = User.objects.get(pk=user_id_str)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer.save(session_title=session_title, chat_content=chat_content)
    
    def get_queryset(self):
        user_no = self.request.query_params.get('user_no')
        if user_no is not None:
            return ChatSession.objects.filter(user_no_id=user_no)
        return ChatSession.objects.all()

    def update(self, request, pk=None):
        try:
            session = ChatSession.objects.get(pk=pk)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
os.environ["OPENAI_API_KEY"] = os.getenv('OPENAI_API_KEY')
persist_directory = str(settings.BASE_DIR)

embedding = OpenAIEmbeddings()
vectordb = Chroma(
    persist_directory=persist_directory,
    embedding_function=embedding)
retriever = vectordb.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
template =  """
You are a kind company's internal regulations 도우미 for new employees at Argo.

{context}

1.Make sure to answer in Korean. 
2.Our company's name is ARGO.
3.Do your best to answer the question regard on {context}.
4.if the question is about general knowledge or is not in context, use your knowledge to answer.
5.Feel free to use any tools available to look up.
6.Speak politely.
7.Replace second character of names to '*' when your answer includes names.
8.When you display someone's number, please replace the middle four digits to '****'.

Question: {question}
Answer:
"""

prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI(temperature=0.15,
                    max_tokens=2000,
                    model_name='gpt-4-1106-preview',)
output_parser = StrOutputParser()
setup_and_retrieval = RunnableParallel(
    {"context": retriever,
     "question": RunnablePassthrough()
     }
)
chain = setup_and_retrieval | prompt | model | output_parser

# 챗봇의 답변을 반환하는 뷰
@csrf_exempt
def chatbot_response(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_message = data['message']
        
        if 'is_first_message' in data and data['is_first_message']:
            session_title = generate_session_title(user_message)
        else:
            session_title = None
            
        chatbot_response = generate_response(user_message)
        response_data = {'reply': chatbot_response}
        if session_title:
            response_data['session_title'] = session_title
        return JsonResponse(response_data)

def generate_response(message):
    return chain.invoke(message)

def generate_session_title(user_message):
    client = OpenAI()
    user_message = user_message
    chat_title = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": f"user only speaks Korean. Please Create a simple, polite and short title based on the following user input : {user_message}"
        }
    ],
    model="gpt-3.5-turbo-1106",
    )       
    return chat_title.choices[0].message.content

