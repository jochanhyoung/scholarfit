import time
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from db import fetch_all_scholarships
import google.generativeai as genai  # 구글 리서치 AI 라이브러리

_google_api_key = os.getenv("GOOGLE_API_KEY")
if not _google_api_key:
    raise ValueError("환경변수 GOOGLE_API_KEY가 없습니다.")
genai.configure(api_key=_google_api_key)

def get_embedding(text):
    """구글 리서치 AI를 사용하여 텍스트를 벡터로 변환 (DB 벡터화의 핵심)"""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def build_search_engine():
    print("DB에서 장학금 데이터를 불러오는 중...")
    scholarships = fetch_all_scholarships()
    
    if not scholarships:
        print("⚠️ 불러올 장학금 데이터가 없습니다.")
        return [], None

    print(f"{len(scholarships)}개의 장학금 데이터 벡터화 시작 (Metric Learning)...")
    
    # 제목과 내용을 합쳐서 의미를 풍부하게 만듭니다.
    texts = [f"{s.get('title', '')} {s.get('description', '')}" for s in scholarships]
    
    # 실전에서는 리스트 전체를 한 번에 임베딩하는 것이 효율적입니다.
    embeddings = []
    for text in texts:
        embeddings.append(get_embedding(text))
    
    print("DB 벡터화 완료!")
    return scholarships, np.array(embeddings)

def search(user_input, scholarships, scholarship_embeddings):
    """사용자 입력과 가장 유사한 장학금 찾기"""
    # 사용자 입력 벡터화
    user_vec = get_embedding(user_input)
    
    # 코사인 유사도 계산 (Metric Learning 실전 적용)
    scores = cosine_similarity([user_vec], scholarship_embeddings)[0]
    
    # 점수 순으로 정렬하여 상위 3개 반환
    top_indices = np.argsort(scores)[::-1][:3]
    results = []
    for i in top_indices:
        results.append({
            "info": scholarships[i],
            "score": round(float(scores[i]), 4)
        })
    return results

# --- 실행부 ---
if __name__ == "__main__":
    print("Scholarfit AI 검색 엔진 가동 시작")
    
    try:
        # 엔진 초기화 (DB 벡터화 실행)
        items, vectors = build_search_engine()

        while True:
            print("\n" + "="*30)
            user_q = input("찾으시는 장학금 조건을 입력하세요 (종료: Ctrl+C): ")
            
            if not user_q: continue
            
            print("AI가 최적의 장학금을 분석 중입니다...")
            matches = search(user_q, items, vectors)
            
            print("\n추천 검색 결과:")
            for m in matches:
                print(f"- [{m['info']['title']}] 유사도: {m['score']}")
                
    except KeyboardInterrupt:
        print("\nScholarfit AI 검색 엔진 종료")
    except Exception as e:
        print(f"❌ 시스템 오류 발생: {e}")
