import json
import os
from datetime import datetime

def check_alive_scholarships():
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "AI_search", "data", "scholarship_data.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    user_info = {
        "is_new": False,
        "grade": 3,
        "gpa": 3.5,
        "gender": "여성",
        "region_id": 1,
        "income_decile": 5,
        "degree_level": "학부"
    }

    current_date = datetime.now()
    alive_list = []
    reason_counts = {"deadline": 0, "filter": 0}

    for s in data:
        deadline_str = s.get('deadline', '9999-12-31')
        is_alive = True
        try:
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
            if deadline < current_date:
                reason_counts["deadline"] += 1
                is_alive = False
        except: pass
        
        if not is_alive: continue

        if s.get('is_new_student') is not None and user_info.get('is_new') != s['is_new_student']:
            is_alive = False
        elif not ( (s.get('min_grade') or 1) <= user_info.get('grade') <= (s.get('max_grade') or 4) ):
            is_alive = False
        elif s.get('min_gpa') is not None and s.get('min_gpa') <= 4.5 and user_info.get('gpa') < s['min_gpa']:
            is_alive = False
        elif s.get('required_gender') and s.get('required_gender') != '무관' and user_info.get('gender') != s['required_gender']:
            is_alive = False
        elif s.get('region_id') and s.get('region_id') != 0 and user_info.get('region_id') != s['region_id']:
            is_alive = False
        elif s.get('max_income_decile') is not None and user_info.get('income_decile') > s['max_income_decile']:
            is_alive = False
        elif user_info.get('degree_level') not in s.get('target_degree', ['학부']):
            is_alive = False

        if is_alive:
            alive_list.append(s)
        else:
            reason_counts["filter"] += 1

    print(f"--- Scholarfit 데이터 진단 결과 ---")
    print(f"전체 데이터 수: {len(data)}개")
    print(f"마감 기한 지남: {reason_counts['deadline']}개")
    print(f"조건 미달(성적/지역 등): {reason_counts['filter']}개")
    print(f"✅ 최종 노출 가능: {len(alive_list)}개")
    print(f"----------------------------------\n")
    
    if alive_list:
        print("[남은 장학금 목록]")
        for i, s in enumerate(alive_list[:20], 1):
            print(f"{i}. [{s.get('deadline')}] {s.get('title')}")
    else:
        print("⚠️ 현재 조건으로 신청 가능한 장학금이 0개입니다.")

if __name__ == "__main__":
    check_alive_scholarships()
