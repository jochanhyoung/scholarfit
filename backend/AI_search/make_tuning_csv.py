import json

file_path = '/home/devuser/repo/app/backend/AI_search/data/scholarship_data.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("input,output")
for i, item in enumerate(data[:30]): # 상위 30개만 추출
    title = item.get('title', '')
    # AI가 학습할 질문과 정답(JSON) 쌍 생성
    q = f"{title} 신청 기간이랑 대상 알려줘"
    ans = f"{'title': '{title}', 'degree': 'undergraduate', 'check_date': '2026-04-29'}"
    print(f'"{q}","{ans}"')
