import json
import os

file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", "AI_search", "data", "scholarship_data.json")

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ 전체 데이터 개수: {len(data)}개")
    print("-" * 50)
    
    for i, x in enumerate(data[:20]):
        title = x.get('title', '제목 없음')
        deadline = x.get('deadline', '기한 정보 없음')
        degree = x.get('target_degree', '학위 정보 없음')
        print(f"{i+1:2d}. {title[:30]}... | 마감: {deadline} | 학위: {degree}")

except Exception as e:
    print(f"❌ 에러 발생: {e}")
