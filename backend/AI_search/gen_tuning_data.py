import json

json_path = '/home/devuser/repo/app/backend/AI_search/data/scholarship_data.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("input,output")
for item in data[:30]:
    title = item.get('title', '장학금')
    user_query = f"{title} 신청하고 싶은데 지금 가능해?"
    ai_response = f"{{\"title\": \"{title}\", \"degree\": \"학부\", \"status\": \"active\"}}"
    print(f'"{user_query}","{ai_response}"')
