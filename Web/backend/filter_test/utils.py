import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestClassifier
from surprise import Dataset, Reader, KNNWithMeans
import numpy as np

# 사용자 상호작용 데이터를 불러오고 정제하는 함수
def create_interaction_matrix(df, question_df, category_ids):
    # 카테고리에 해당하는 문제들만 필터링
    filtered_questions = question_df[question_df['category_no_id'].isin(category_ids)]

    # 해당 문제들에 대한 사용자 상호작용만 포함
    filtered_df = df[df['question_no_id'].isin(filtered_questions['question_no'])]
    
    # 상호작용 데이터프레임 생성
    interaction_matrix = pd.pivot_table(
        filtered_df, index='user_no_id', columns='question_no_id', values='is_correct'
    ).fillna(0)
    return interaction_matrix, filtered_questions

# 문제 간 코사인 유사도 계산 및 유사 문제 그룹화
def calculate_similarity(interaction_matrix):
    if not isinstance(interaction_matrix, pd.DataFrame):
        matrix_2d = pd.DataFrame(interaction_matrix).T
    else:
        matrix_2d = interaction_matrix.T

    cosine_sim_matrix = cosine_similarity(matrix_2d)

    # NumPy 배열을 DataFrame으로 변환
    similarity_df = pd.DataFrame(cosine_sim_matrix, index=matrix_2d.index, columns=matrix_2d.index)
    return similarity_df

# TruncatedSVD를 사용한 임베딩 생성
def create_problem_embeddings(interaction_matrix, n_components=12):
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    problem_embeddings = svd.fit_transform(interaction_matrix.T)
    return problem_embeddings

# 유사한 문제 그룹화
def group_similar_problems(similarity_matrix, threshold=0.5):
    groups = {}
    for idx, row in similarity_matrix.iterrows():
        similar_items = row[row > threshold].index.tolist()
        groups[idx] = similar_items
    return groups

# 오답률이 높을 것으로 예측된 문제 추천
def recommend_difficult_problems(user_no, interaction_matrix, similar_problems, problem_embeddings):
    difficulty_scores = {}
    for problem in interaction_matrix.columns:
        if interaction_matrix.loc[user_no, problem] == 0:  # 사용자가 풀지 않은 문제
            similar_group = similar_problems[problem]
            group_scores = interaction_matrix.loc[user_no, similar_group]
            group_mean = group_scores.mean()
            difficulty_scores[problem] = group_mean
    top_difficult = sorted(difficulty_scores, key=difficulty_scores.get, reverse=True)[:3]
    return top_difficult

# 카테고리별 문제 추천 및 확률 계산
def recommend_problems_by_category(user_no, category_ids, results_data, questions_data):
    category_recommendations = {}
    for category_id in category_ids:
        # 특정 카테고리에 해당하는 문제 데이터 필터링
        filtered_questions = questions_data[questions_data['category_no_id'] == category_id]
        interaction_matrix, _ = create_interaction_matrix(results_data, filtered_questions, [category_id])

        # 코사인 유사도 계산 및 유사 문제 그룹화
        similarity_matrix = calculate_similarity(interaction_matrix)
        similar_problems = group_similar_problems(similarity_matrix)

        # 문제 임베딩 생성
        problem_embeddings = create_problem_embeddings(interaction_matrix)

        # 오답률이 높을 것으로 예상되는 문제 추천
        recommendations = recommend_difficult_problems(user_no, interaction_matrix, similar_problems, problem_embeddings)
        category_recommendations[category_id] = recommendations

    return category_recommendations

# RandomForestClassifier를 사용하여 오답률이 높을 것 같은 문제 예측
def predict_problem_difficulty(user_no, interaction_matrix, problem_embeddings):
    user_interactions = interaction_matrix.loc[user_no, :]
    unsolved_problems = user_interactions.index[user_interactions == 0]

    problem_indices = {col: idx for idx, col in enumerate(interaction_matrix.columns)}
    valid_indices = [problem_indices[prob] for prob in unsolved_problems if prob in problem_indices]

    features = problem_embeddings[valid_indices, :]
    rf = RandomForestClassifier(n_estimators=100, random_state=42)

    if features.size > 0:
        rf.fit(features, user_interactions.loc[unsolved_problems].values)
        solving_probabilities = rf.predict_proba(features)[:, 1]
        return solving_probabilities
    else:
        return np.array([])

def generate_recommendations(user_no, interaction_matrix, problem_embeddings):
    difficulty_probabilities = predict_problem_difficulty(user_no, interaction_matrix, problem_embeddings)
    top_n_difficult = difficulty_probabilities.argsort()[:3]
    return interaction_matrix.columns[top_n_difficult].tolist()