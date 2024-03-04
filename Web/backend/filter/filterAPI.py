from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from surprise import Dataset, Reader
from surprise import KNNWithMeans
from surprise import accuracy
from surprise.model_selection import train_test_split as surprise_train_test_split

app = Flask(__name__)

# 데이터셋 및 모델 초기화
# 여기서는 단순화를 위해 데이터와 모델을 글로벌 변수로 설정합니다.
# 실제 프로덕션 환경에서는 데이터베이스나 파일 시스템에서 데이터를 로드하고,
# 모델을 별도의 서비스나 인프라에서 관리하는 것이 일반적입니다.

# 데이터셋
data = {
    'user_id': ['User1', 'User2', 'User1', 'User3', 'User1','User4', 'User5', 'User1'],
    'problem_id': ['Prob1', 'Prob1', 'Prob2', 'Prob2', 'Prob3','Prob1', 'Prob1', 'Prob4'],
    'problem_type': ['occupation', 'occupation', 'commonsense', 'commonsense', 'ethic', 'occupation', 'occupation', 'tools'],
    'solved': [1, 0, 0, 1, 1, 1, 1, 0]
}
df = pd.DataFrame(data)

# 문제 추천 모델 구성 및 훈련
# 이 부분에 실제 모델 훈련 코드를 추가합니다.

@app.route('/recommend_problems', methods=['GET'])
def recommend_problems():
    user_id = request.args.get('user_id')
    # 문제 추천 로직 구현
    # 예시: user_id에 대한 추천 문제 목록 반환
    recommended_problems = ['Prob1', 'Prob3']  # 여기에 실제 추천 로직 결과를 넣습니다.
    return jsonify(recommended_problems)

@app.route('/predict_solving_probability', methods=['POST'])
def predict_solving_probability():
    data = request.json
    user_id = data['user_id']
    problem_id = data['problem_id']
    # 문제 해결 확률 예측 로직 구현
    # 예시: user_id가 problem_id를 해결할 확률 반환
    solving_probability = 0.75  # 여기에 실제 예측 로직 결과를 넣습니다.
    return jsonify({'user_id': user_id, 'problem_id': problem_id, 'probability': solving_probability})

if __name__ == '__main__':
    app.run(debug=True)
