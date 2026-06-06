from sentence_transformers import SentenceTransformer, util

# 1. 한국어 임베딩에 강한 모델 로드 (Hugging Face)
model = SentenceTransformer('snunlp/KR-SBERT-V40K-klueNLI-augSTS')

def get_recommendations(user_profile_text, scholarship_texts):
    # 사용자 프로필을 문장으로 만듦 (예: "3학년 공대생, 성적 4.0, 소득 5분위")
    user_embedding = model.encode(user_profile_text)
    
    # 장학금 상세 설명들을 벡터화
    scholarship_embeddings = model.encode(scholarship_texts)
    
    # 코사인 유사도 계산 (Metric Learning의 핵심!)
    cos_scores = util.cos_sim(user_embedding, scholarship_embeddings)[0]
    
    return cos_scores