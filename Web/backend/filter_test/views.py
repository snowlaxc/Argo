from django.shortcuts import render
from learn.models import Result, Question, Answer
from django.http import JsonResponse
from .utils import (
    create_interaction_matrix, calculate_similarity, create_problem_embeddings,
    generate_recommendations,group_similar_problems,recommend_difficult_problems,recommend_problems_by_category
)
from datetime import datetime, timedelta
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
import mlflow.pyfunc
from django.db.models import Avg,Q,Count
import os
import random
from dotenv import load_dotenv
load_dotenv()

@csrf_exempt
@require_http_methods(["POST"])
def recommend_problems_view(request):
    try:
        data = json.loads(request.body)
        user_no = data['user_no']

        # 데이터 불러오기
        results_data = pd.DataFrame(list(Result.objects.all().values()))
        questions_data = pd.DataFrame(list(Question.objects.all().values()))

        # 카테고리별 문제 추천
        category_ids = [1, 2, 3]
        category_recommendations = recommend_problems_by_category(user_no, category_ids, results_data, questions_data)
        
        # 카테고리 중에서 랜덤하게 하나를 선택
        selected_category = random.choice(list(category_recommendations.keys()))

        # 선택된 카테고리에서 문제 중 하나를 랜덤하게 선택
        if category_recommendations[selected_category]:
            final_recommendation = random.choice(category_recommendations[selected_category])
        else:
            final_recommendation = None
            
        #선택된 문제 json화
        question = Question.objects.get(question_no = final_recommendation)
        choice = Answer.objects.filter(question_no = question.question_no)
        kor = question.korean
        choice_list = []
        # 주관식이면 0 
        # 객관식이면 1
        is_many_choice = None
        for item in choice:
            tmp_dic = {
                'answer_content' : item.content,
                'answer_no': item.answer_no
            }
            choice_list.append(tmp_dic)
            
            if item.is_correct ==1:
                answer = item.content
        if len(choice_list) ==1:
            is_many_choice = 0
        else:
            is_many_choice = 1

        
        data = {
            'question_no': question.question_no,
            'question_content': question.content,
            'choices': choice_list,
            'correct_answer': answer,
            'is_many_choice' : is_many_choice,
            'korean' : kor,
        }
        return JsonResponse({'wrong_question': data})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except KeyError:
        return JsonResponse({'error': 'user_no is required'}, status=400)



# MLflow 추적 서버 설정
mlflow.set_tracking_uri(os.getenv('MLFLOW_URL'))
# 모델 로드
model_name = "grouping_model"
model_group = mlflow.pyfunc.load_model(f"models:/{model_name}/Production")

def get_user_category_scores(user_no):
    # 카테고리 1, 2, 3에 해당하는 데이터만 집계
    category_scores = Result.objects.filter(
        user_no=user_no,
        question_no__category_no__in=[1, 2, 3]  # 1, 2, 3번 카테고리에 해당하는 결과만 필터링
    ).values(
        'question_no__category_no'  # 'question' 대신 'question_no' 사용
    ).annotate(
        average_score=Avg('is_correct')
    ).order_by(
        'question_no__category_no'
    )
    # 카테고리별 평균 점수를 리스트로 변환
    scores = {'category_no1': 0, 'category_no2': 0, 'category_no3': 0}
    for item in category_scores:
        category = item['question_no__category_no']
        scores[f'category_no{category}'] = item['average_score']
    return scores

@csrf_exempt
@require_http_methods(["POST"])
def feedback(request):
    data = json.loads(request.body)
    user_no = data['user_no']
    
    # 특정 사용자의 카테고리별 평균 점수 계산
    user_category_scores = get_user_category_scores(user_no)
    
    # 사용자가 카테고리별로 최소 한 문제라도 풀었는지 확인
    if all(score == 0 for score in user_category_scores.values()):
        # 모든 카테고리의 점수가 0인 경우
        return JsonResponse({
            "time": [],
            "avg": [],
            "score": [],
            "description": "평가를 할 수 없습니다. 문제를 더 풀어주세요",
            "cat": ["영어", "한국어", "시사"],
            "percentage": [0, 0, 0]
        })
    
    # 사용자와 같은 그룹의 평균
    # 모든 사용자에 대한 그룹 예측
    all_users_data = predict_groups_for_all_users()

    # 특정 사용자의 그룹 찾기
    target_user_group = all_users_data[all_users_data['user_no'] == user_no]['predicted_group'].iloc[0]

    # 동일 그룹 사용자의 평균 점수 계산
    same_group_users = all_users_data[all_users_data['predicted_group'] == target_user_group]
    average_scores = same_group_users[['category_no1', 'category_no2', 'category_no3']].mean().to_dict()

    # 카테고리와 평균 점수 분리
    cat = ["영어", "한국어", "시사"]
    percentage = [round(average_scores.get(f'category_no{idx}', 0) * 100) for idx in range(1, 4)]
    
    # JSON 파일에서 그룹 설명 로드
    group_descriptions = load_group_descriptions()
    group_description = group_descriptions.get(target_user_group, "No description available.")
    
    # 사용자 카테고리별 피드백
    # JSON 파일에서 피드백 스크립트 로드
    feedback_scripts = load_feedback_scripts()

    # 사용자 피드백 생성
    feedback = {}
    for idx, category in enumerate(['english', 'korean', 'current_affairs'], start=1):
        user_score = user_category_scores.get(f'category_no{idx}', 0)
        group_avg = average_scores.get(f'category_no{idx}', 0)
        score_diff = (user_score - group_avg) * 100
        
        # 스크립트 id 결정
        if score_diff >= 5:
            script_id = 0
        elif 0 < score_diff < 5:
            script_id = 1
        elif -5 <= score_diff < 0:
            script_id = 3
        elif score_diff < -5:
            script_id = 2
         
        # 해당 스크립트 id에 맞는 피드백 찾기
        for script in feedback_scripts[category]:
            if script['id'] == script_id:
                feedback[category] = script['feedback']
                break
        
    # 그룹 설명과 카테고리별 피드백을 결합
    description = group_description + " " + " ".join([fb for _, fb in feedback.items()])
    
    time = get_last_six_days(user_no)
    avg = get_avg_score_except_user(user_no, time)
    score = get_user_score(user_no, time)
    
    return JsonResponse({
        'time': time,
        'avg': avg,
        'score': score,
        'description': description,
        'cat': cat,
        'percentage': percentage
    })
    

def calculate_all_users_scores():
    # 모든 사용자의 카테고리별 평균 점수 계산
    users_scores = Result.objects.filter(
        question_no__category_no__in=[1, 2, 3]
    ).values(
        'user_no'
    ).annotate(
        category_no1=Avg('is_correct', filter=Q(question_no__category_no=1)),
        category_no2=Avg('is_correct', filter=Q(question_no__category_no=2)),
        category_no3=Avg('is_correct', filter=Q(question_no__category_no=3))
    )
    return users_scores

def predict_groups_for_all_users():
    users_scores = calculate_all_users_scores()
    # DataFrame으로 변환
    data = pd.DataFrame(list(users_scores))
    #결측치 0 대체 or user 삭제
    # data = data.fillna(0)
    data = data.dropna()
    # 모델에 데이터 입력 및 그룹 예측
    predictions = model_group.predict(data[['category_no1', 'category_no2', 'category_no3']])
    data['predicted_group'] = predictions
    return data

# JSON 파일 로드 함수
def load_group_descriptions():
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, 'description.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        return {item['id']: item['description'] for item in data['items']}
    
def load_feedback_scripts():
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(current_dir, 'description.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

# 유저가 문제를 푼 날짜 중 최근 6개의 날짜를 UNIX 시간으로 변환하는 함수
def get_last_six_days(user_no):
    unique_days = Result.objects.filter(user_no=user_no).dates('timestamp', 'day', order='ASC').distinct()[:6]
    days_as_timestamp = [int(datetime.combine(day, datetime.min.time()).timestamp() * 1000) for day in unique_days]
    # 6일보다 적은 경우 첫 날짜로 채움
    while len(days_as_timestamp) < 6:
        days_as_timestamp.insert(0, days_as_timestamp[0])
    
    return days_as_timestamp

# 다른 모든 사용자의 시사/상식 평균 점수 계산
def get_avg_score_except_user(user_no, unique_days):
    avg_scores = []
    for day in unique_days:
        day_date = datetime.fromtimestamp(day / 1000).date()
        avg_score = Result.objects.exclude(user_no=user_no).filter(
            timestamp__date=day_date, question_no__category_no__classification='시사/상식'
        ).aggregate(Avg('is_correct'))['is_correct__avg']
        avg_scores.append(avg_score * 100 if avg_score else 0)
    return avg_scores

# 사용자의 시사/상식 평균 점수 계산
def get_user_score(user_no, unique_days):
    user_scores = []
    for day in unique_days:
        day_date = datetime.fromtimestamp(day / 1000).date()
        user_score = Result.objects.filter(
            user_no=user_no, timestamp__date=day_date, question_no__category_no__classification='시사/상식'
        ).aggregate(Avg('is_correct'))['is_correct__avg']
        user_scores.append(user_score * 100 if user_score else 0)
    return user_scores