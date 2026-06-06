import pandas as pd

def preprocess_user_data(user_info):
    """
    와이어플로우에서 넘어온 사용자 정보를 모델 입력용으로 변환
    user_info: {'grade': 3, 'gpa': 4.0, 'income': 5, ...}
    """
    # 1. 성적 정규화 (4.5 만점 기준)
    normalized_gpa = user_info['gpa'] / 4.5
    
    # 2. 소득 분위 정규화 (1~10분위)
    normalized_income = user_info['income'] / 10.0
    
    return [normalized_gpa, normalized_income] # 임베딩 모델의 입력값

def calculate_similarity(user_vector, scholarship_vector):
    """
    Metric Learning에서 배운 코사인 유사도 계산
    """
    from sklearn.metrics.pairwise import cosine_similarity
    return cosine_similarity([user_vector], [scholarship_vector])[0][0]
