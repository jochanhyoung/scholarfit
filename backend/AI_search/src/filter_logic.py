import re
import json
import os
import numpy as np
from datetime import datetime

_CITY_KEYWORD_MAP = {
    "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구",
    "인천광역시": "인천", "광주광역시": "광주", "대전광역시": "대전",
    "울산광역시": "울산", "세종특별자치시": "세종", "경기도": "경기",
    "강원특별자치도": "강원", "강원도": "강원", "충청북도": "충북",
    "충청남도": "충남", "전라북도": "전북", "전북특별자치도": "전북",
    "전라남도": "전남", "경상북도": "경북", "경상남도": "경남",
    "제주특별자치도": "제주",
}

_GEO_EXTRACT = re.compile(
    r'([가-힣]{2,6})(광역시|특별시|특별자치시|특별자치도|시|군|구)'
)

_FULL_ADMIN_NAMES = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도",
    "강원특별자치도", "충청북도", "충청남도", "전라북도", "전북특별자치도",
    "전라남도", "경상북도", "경상남도", "제주특별자치도",
]

_ALL_REGIONAL_KEYWORDS: set[str] = set(_CITY_KEYWORD_MAP.values()) | set(_FULL_ADMIN_NAMES)

_GEO_STOPWORDS = {
    # legal entity terms
    "재단법인", "사단법인", "학교법인", "재단", "법인",
    # generic terms that appear in qualification text
    "사업", "공익", "장학", "미래", "인재", "교육",
    "검정고", "졸업", "현역", "지원", "발생", "필요",
    "선발", "사회", "소득", "양육", "한부모가", "입학",
    "수상", "자격", "추천", "신청", "접수", "심사",
    "제대", "복무", "휴학", "편입", "전학",
    # university name prefixes (prevent "전남대학교" → "전남대" being treated as a city)
    "전남대", "경북대", "충남대", "충북대", "전북대",
    "강원대", "제주대", "경상대", "부경대", "인하대",
    "한양대", "연세대", "고려대", "서울대", "성균관",
    "동국대", "홍익대", "숙명여대", "이화여대", "건국대",
    "국민대", "단국대", "아주대", "세종대", "명지대",
    "중앙대", "경희대", "한국외대", "서강대", "포항공",
}


def _init_regional_keywords() -> None:
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    full_json = os.path.join(base, "data", "scholarship_data.json")
    sources = []
    if os.path.exists(full_json):
        with open(full_json, "r", encoding="utf-8") as f:
            sources = json.load(f)
    for s in sources:
        text = ' '.join([
            s.get('provider') or '',
            s.get('title') or '',
            s.get('qualification') or '',
            s.get('selection_criteria') or '',
        ])
        for m in _GEO_EXTRACT.finditer(text):
            name = m.group(1)
            if len(name) >= 2 and name not in _GEO_STOPWORDS:
                _ALL_REGIONAL_KEYWORDS.add(name)


def city_to_keyword(city: str) -> str:
    return _CITY_KEYWORD_MAP.get(city, city)


def is_nationwide(text: str) -> bool:
    return not any(kw in text for kw in _ALL_REGIONAL_KEYWORDS)


def matches_city(text: str, city_kw: str, district: str) -> bool:
    if city_kw and city_kw in text:
        return True
    if district:
        district_short = district.rstrip("시군구")
        if len(district_short) >= 2 and district_short in text:
            return True
    return False


def build_user_location_names(city_kw: str, district: str) -> tuple[set, str]:
    district_short = district.rstrip('시군구') if district else ''
    names = set()
    if city_kw:
        names.add(city_kw)
    if district:
        names.add(district)
    if district_short and len(district_short) >= 2:
        names.add(district_short)
    label = district_short or city_kw or '미설정'
    return names, label


def hard_filter(data: list, vectors: np.ndarray, user_info: dict) -> tuple[list, np.ndarray]:
    filtered_indices = []
    current_date = datetime.now()
    city_kw = city_to_keyword(user_info.get('city') or '')
    district = user_info.get('district') or ''
    user_region = user_info.get('region_id')
    user_location_names, user_location_label = build_user_location_names(city_kw, district)

    for i, s in enumerate(data):
        title = s.get('title', '')

        deadline_str = s.get('deadline', '9999-12-31')
        try:
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d')
            if deadline < current_date:
                print(f"[필터] '{title}' 제외: 마감일 초과 ({deadline_str})")
                continue
        except Exception:
            pass

        grade_type_str = s.get('grade_type') or ''
        has_new = '대학신입생' in grade_type_str
        has_existing = any(x in grade_type_str for x in [
            '대학2학기', '대학3학기', '대학4학기',
            '대학5학기', '대학6학기', '대학7학기', '대학8학기'
        ])
        user_is_new = user_info.get('is_new', False)
        if has_new and not has_existing and not user_is_new:
            print(f"[필터] '{title}' 제외: 신입생 전용")
            continue
        if not has_new and has_existing and user_is_new:
            print(f"[필터] '{title}' 제외: 재학생 전용")
            continue

        min_g = s.get('min_grade') or 1
        max_g = s.get('max_grade') or 8
        if not (min_g <= user_info.get('grade', 1) <= max_g):
            print(f"[필터] '{title}' 제외: 학년 불일치 (허용={min_g}~{max_g}, 사용자={user_info.get('grade', 1)})")
            continue

        user_gpa = user_info.get('gpa', 0)
        min_gpa = s.get('min_gpa')
        if min_gpa is not None and min_gpa <= 4.5:
            if user_gpa < min_gpa:
                print(f"[필터] '{title}' 제외: 학점 미달 (최소={min_gpa}, 사용자={user_gpa})")
                continue

        user_gender = user_info.get('gender')
        req_gender = s.get('required_gender')
        if req_gender and req_gender != '무관':
            if user_gender != req_gender:
                print(f"[필터] '{title}' 제외: 성별 불일치 (요구={req_gender}, 사용자={user_gender})")
                continue

        req_region = s.get('region_id')
        if req_region is not None:
            if isinstance(req_region, list):
                is_nationwide_region = 0 in req_region
                if not is_nationwide_region and user_region not in req_region:
                    print(f"[필터] '{title}' 제외: 지역 불일치 (허용={req_region}, 사용자={user_region})")
                    continue
            else:
                is_nationwide_region = req_region == 0
                if not is_nationwide_region and user_region != req_region:
                    print(f"[필터] '{title}' 제외: 지역 불일치 (공고지역={req_region}, 사용자지역={user_region})")
                    continue

        user_income = user_info.get('income_decile', 10)
        max_income = s.get('max_income_decile')
        if max_income is not None:
            if user_income > max_income:
                print(f"[필터] '{title}' 제외: 소득분위 초과 (최대={max_income}, 사용자={user_income})")
                continue

        has_undergrad = '대학' in grade_type_str
        has_grad = '박사' in grade_type_str or '석사' in grade_type_str
        user_degree = user_info.get('degree_level', '학부')
        if user_degree == '학부' and has_grad and not has_undergrad:
            print(f"[필터] '{title}' 제외: 대학원 전용")
            continue
        if user_degree in ('석사', '박사') and has_undergrad and not has_grad:
            print(f"[필터] '{title}' 제외: 학부 전용")
            continue

        if user_location_names:
            qual_text = s.get('qualification') or ''
            meta_text = ' '.join([s.get('provider') or '', s.get('title') or ''])

            qual_geo_names = sorted({
                m[0] for m in _GEO_EXTRACT.findall(qual_text)
                if m[0] not in _GEO_STOPWORDS and len(m[0]) >= 2
            })

            if qual_geo_names:
                user_match = any(loc in qual_text for loc in user_location_names)
                print(f"[Region Debug] User: {user_location_label} / Text Cities Found: {qual_geo_names} / Result: {'PASS' if user_match else 'FAIL'}")
                if not user_match:
                    print(f"[필터] '{title}' 제외: 지역 자격조건 불일치 (사용자={user_location_label}, 제한={qual_geo_names})")
                    continue
            else:
                meta_match = is_nationwide(meta_text) or any(loc in meta_text for loc in user_location_names)
                print(f"[Region Debug] User: {user_location_label} / No qual restriction / Meta check: {'PASS' if meta_match else 'FAIL'}")
                if not meta_match:
                    print(f"[필터] '{title}' 제외: 지역 텍스트 불일치 (사용자={user_location_label})")
                    continue

        filtered_indices.append(i)

    if not filtered_indices:
        return [], np.array([])
    return [data[i] for i in filtered_indices], vectors[filtered_indices]


_init_regional_keywords()
