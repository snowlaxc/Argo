"""
_summary_
협업 필터 구현

    1. 아이템 협업 필터 구현
    - 문제간 유사도 계산
    - 문제 embedding 생성
    - 해당 아이템에 대한 사용자별 문제 해결 확률 예측

    * 일차적으로 직무 (Occupation, category: 4) 부분에 대한 분류로 테스트
        -> 학습시 대분류/소분류를 적용 해서 그 후 분류가 잘 되는지 확인.

    2. 사용자 협업 필터 구현
    - 문제의 정/오답률을 기반으로 각 사용자가
    어떤 문제 유형을 맞출 확률이 높은지 예측

    3. 연산 중 에러 발생 상황 대처를 위해 try-catch 블럭 사용

    4. 각 항목들을 모듈화 해서, 다른 페이지에서 함수처럼 불러서 결과를 받아올 수 있도록
"""
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from surprise import Dataset, Reader
from surprise import KNNWithMeans
from surprise.model_selection import train_test_split as surprise_train_test_split
from surprise import accuracy
from scipy.sparse import csr_matrix
from sklearn.model_selection import cross_val_score

class ProblemRecommender:
    def __init__(self, data):
        self.data = data
        self.problem_features_sparse = None
        self.embedding_df = None
        self.model = None
        self.algo = None


    def calculate_similarity(self):
        """
        Calculates the cosine similarity between problems based on user interactions.
        updated to use sparse matrix for efficiency

        Returns:
            pandas.DataFrame: A DataFrame containing the similarity matrix between problems.
        """
        # Create the pivot table and fill NA values
        pivot_table = self.data.pivot_table(index='problem_id', columns='user_id', values='solved').fillna(0)

        # Convert the pivot table to a sparse matrix
        self.problem_features_sparse = csr_matrix(pivot_table)

        # Calculate the cosine similarity
        similarity_matrix = cosine_similarity(self.problem_features_sparse)

        # Create the DataFrame using the indices from the pivot table
        similarity_df = pd.DataFrame(
            similarity_matrix,
            index=pivot_table.index,
            columns=pivot_table.index
        )
        return similarity_df


    def create_embeddings(self, n_components=2):
        """
        This method creates embeddings for problems using Truncated Singular Value Decomposition (SVD).
        TruncatedSVD is used to reduce the dimensions of the problem features to 2 (for easier visualization or further processing).

        Args:
            n_components (int, optional): Number of components for SVD. Defaults to 2.

        Returns:
            pandas.DataFrame: The resulting embeddings stored in self.embedding_df.
        """
        if self.problem_features_sparse is None:
            raise ValueError("Sparse problem features not found. Please run calculate_similarity first.")

        svd = TruncatedSVD(n_components=n_components)
        problem_embedding = svd.fit_transform(self.problem_features_sparse)
        self.embedding_df = pd.DataFrame(problem_embedding, index=self.problem_features_sparse.index)
        return self.embedding_df

    def predict_solving_probability(self, classifier=RandomForestClassifier(n_estimators=100, random_state=42)):
        """
        This method predicts the probability of problems being solved by users.

        The data is first split into training and test sets.
        The method trains the classifier (RandomForestClassifier by default) on the training data
        and then predicts the probabilities on the test data.

        Args:
            classifier (_type_, optional):  allow different machine learning models and parameters to be used.
            Defaults to RandomForestClassifier(n_estimators=100, random_state=42).

        Returns:
            _type_: The predicted probabilities are returned.
        """
        X = pd.get_dummies(self.data.drop('solved', axis=1), columns=['user_id', 'problem_id', 'problem_type'])
        y = self.data['solved']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        self.model = classifier
        self.model.fit(X_train, y_train)
        predictions = self.model.predict_proba(X_test)
        return predictions

    def item_based_collaborative_filtering(self):
        """
        This method implements an item-based collaborative filtering algorithm.
        It uses the KNNWithMeans algorithm from the "surprise" library, configured for
        item-based (as opposed to user-based) filtering with cosine similarity.

        The data is split into training and test sets, and the algorithm is trained on the training set.
        The method then tests the algorithm on the test set and calculates the root mean square error (RMSE) for the predictions.

        In case of any exception (like a zero-division error, which can happen with small sample sizes),
        the exception is caught and printed.

        Returns:
            _type_: The predictions are returned.
        """
        reader = Reader(rating_scale=(0, 1))
        dataset = Dataset.load_from_df(self.data[['user_id', 'problem_id', 'solved']], reader)
        trainset, testset = surprise_train_test_split(dataset, test_size=0.25, random_state=42)
        self.algo = KNNWithMeans(sim_options={'name': 'cosine', 'user_based': False, 'min_support': 1})
        # 샘플 개수가 적을 때 zero-division 에러 발생할 수 있어서
        # try-catch 블럭으로 시도
        try:
            self.algo.fit(trainset)
            predictions = self.algo.test(testset)
            accuracy.rmse(predictions)
            return predictions
        except ZeroDivisionError:
            print("Zero Division Error occurred")
        except Exception as e:
            print("An error occurred:", e)

    def validate_model(self, classifier=RandomForestClassifier(n_estimators=100, random_state=42)):
        X = pd.get_dummies(self.data.drop('solved', axis=1), columns=['user_id', 'problem_id', 'problem_type'])
        y = self.data['solved']
        scores = cross_val_score(classifier, X, y, cv=5)
        return scores.mean(), scores.std()


# TODO: 피드백 반영 시스템 구현
    def collect_feedback(self, user_id, problem_id, feedback):
        """
        Collects feedback from users about the recommendations.

        Parameters:
        - user_id (int): The ID of the user providing feedback.
        - problem_id (int): The ID of the problem for which feedback is provided.
        - feedback (int): The feedback score or boolean indicating whether the recommendation was helpful.

        Returns:
        None
        """
        # You might want to validate the input here

        # Assuming self.data is a DataFrame that stores user interactions and feedback
        # Add a new row with the feedback information
        self.data = self.data.append({
            'user_id': user_id,
            'problem_id': problem_id,
            'feedback': feedback
        }, ignore_index=True)

    def adjust_weights_based_on_feedback(self):
        """
        Adjusts the weights of problems based on user feedback.

        Returns:
        None
        """
        # Example: Increase the weight of problems with positive feedback
        for index, row in self.data.iterrows():
            if row['feedback'] > 0:  # Assuming positive feedback is indicated by a value greater than 0
                # Increase the weight of this problem
                # The actual logic here depends on how you're calculating recommendations
                # For instance, you could increase the count of 'solved' or adjust the problem's feature vector
                continue

    def recommend_problems(self, user_id):
        """
        Generates problem recommendations for a given user.

        Parameters:
        - user_id (int): The ID of the user for whom to generate recommendations.

        Returns:
        list: A list of recommended problem IDs.
        """
        # First, adjust weights based on feedback
        self.adjust_weights_based_on_feedback()

        # Then, proceed with your existing recommendation logic
        # For example, use calculate_similarity or another method to generate recommendations



# 테스트용 데이터셋
data = {
    'user_id': ['User1', 'User2', 'User1', 'User3', 'User1','User4', 'User5', 'User1'],
    'problem_id': ['Prob1', 'Prob1', 'Prob2', 'Prob2', 'Prob3','Prob1', 'Prob1', 'Prob4'],
    'problem_type': ['occupation', 'occupation', 'commonsense', 'commonsense', 'ethic', 'occupation', 'occupation', 'tools'],
    'solved': [1, 0, 0, 1, 1, 1, 1, 1]
}
df = pd.DataFrame(data)

# 클래스 인스턴스 생성 및 사용
recommender = ProblemRecommender(df)
similarity_df = recommender.calculate_similarity()
embedding_df = recommender.create_embeddings()
solving_probabilities = recommender.predict_solving_probability()
cf_predictions = recommender.item_based_collaborative_filtering()

# 결과 출력
print(similarity_df)
print(embedding_df)
print(solving_probabilities)
print(cf_predictions)
