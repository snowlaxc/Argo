from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from learn.models import Result, Question, Answer
from account.models import User

class GetAllResults(View):
    def get(self, request):
        # Retrieve all results from the database
        results = Result.objects.all().values()
        return JsonResponse(list(results), safe=False)

class GetAllQuestions(View):
    def get(self, request):
        # Retrieve all questions from the database
        questions = Question.objects.all().values()
        return JsonResponse(list(questions), safe=False)

class GetAllAnswers(View):
    def get(self, request):
        # Retrieve all answers from the database
        questions = Answer.objects.all().values()
        return JsonResponse(list(questions), safe=False)

class GetUserData(View):
    def get(self, request):
        # Retrieve user data with specific columns from the database
        users = User.objects.values('user_no', 'id', 'email')
        return JsonResponse(list(users), safe=False)
