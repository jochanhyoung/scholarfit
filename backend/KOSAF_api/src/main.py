import os
import math
import re
import requests
import schedule
import time
import sys
from datetime import date
from typing import Optional, Tuple, Dict, Any, List

from supabase import create_client, Client


# =========================
# 기본 설정
# =========================

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

SUPABASE_URL = os.environ.get("SUPABASE_URL")

# 수집기에서는 service role key 사용 권장
# 프론트엔드에는 절대 service role key를 넣으면 안 됨
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_KEY")
)

API_KEY = os.environ.get("KOSAF_API_KEY")
ENDPOINT_UDDI = os.environ.get("ENDPOINT_UDDI")

if not SUPABASE_URL:
    raise ValueError("환경변수 SUPABASE_URL이 없습니다.")

if not SUPABASE_KEY:
    raise ValueError("환경변수 SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_KEY가 없습니다.")

if not API_KEY:
    raise ValueError("환경변수 KOSAF_API_KEY가 없습니다.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

headers = {
    "Authorization": f"Infuser {API_KEY}",
    "Content-Type": "application/json"
}

CURRENT_UDDI: Optional[str] = None
CURRENT_BASE_URL: Optional[str] = None


# =========================
# 공통 유틸
# =========================

def clean_text(value: Any) -> Optional[str]:
    """
    빈 문자열, '-', '해당없음' 등을 None으로 정리
    """
    if value is None:
        return None

    text = str(value).strip()

    if not text:
        return None

    empty_values = {
        "-",
        "--",
        "없음",
        "해당없음",
        "해당 없음",
        "무",
        "null",
        "None",
        "nan",
    }

    if text in empty_values:
        return None

    return text


def first_text(item: Dict[str, Any], keys: List[str]) -> Optional[str]:
    """
    여러 후보 key 중 가장 먼저 값이 있는 것을 반환
    """
    for key in keys:
        value = clean_text(item.get(key))
        if value:
            return value
    return None


def parse_gpa(gpa_str: Any) -> Tuple[Optional[float], Optional[float]]:
    """
    성적 기준 파싱
    예:
    - 3.5/4.5 -> (3.5, 4.5)
    - 평점 3.0 이상 -> (3.0, None)
    - 백분위 80점 이상 -> 현재는 (80, None)으로 저장될 수 있음
    """
    text = clean_text(gpa_str)
    if not text:
        return None, None

    # 3.5 / 4.5 형태
    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)", text)
    if match:
        return float(match.group(1)), float(match.group(2))

    # 4.5 만점에 3.5 이상 형태
    match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:점|이상|초과)?\s*(?:/|만점)?\s*(\d+(?:\.\d+)?)?\s*만점",
        text
    )
    if match:
        min_gpa = float(match.group(1))
        scale = float(match.group(2)) if match.group(2) else None
        return min_gpa, scale

    # 숫자 하나라도 있으면 최소 기준으로 저장
    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if match:
        return float(match.group(1)), None

    return None, None


def parse_gender(gender_str: Any) -> Optional[str]:
    """
    성별 제한 파싱
    예:
    - 여성, 여자, 여학생 -> 여성
    - 남성, 남자, 남학생 -> 남성
    - 제한없음, 무관 -> None
    """
    text = clean_text(gender_str)
    if not text:
        return None

    if any(word in text for word in ["제한없", "무관", "해당없", "남녀"]):
        return None

    if any(word in text for word in ["여성", "여자", "여학생"]):
        return "여성"

    if any(word in text for word in ["남성", "남자", "남학생"]):
        return "남성"

    return None


def parse_grade_range(grade_str: Any) -> Tuple[Optional[int], Optional[int]]:
    """
    학년구분 텍스트에서 min_grade / max_grade(학년 기준) 추출
    예:
    - '대학신입생' -> (1, 1)
    - '대학2학기대학3학기대학4학기' -> (1, 2)  [2학기=1학년, 4학기=2학년]
    - '대학2학기대학3학기대학4학기대학5학기대학6학기대학7학기대학8학기이상' -> (1, 4)
    - '해당없음' / None -> (None, None)
    """
    text = clean_text(grade_str)
    if not text:
        return None, None

    if any(word in text for word in ["해당없", "무관", "제한없"]):
        return None, None

    semesters: list[int] = []

    # 신입생 = 1학기
    if "신입생" in text:
        semesters.append(1)

    # 대학N학기 패턴 추출
    for m in re.finditer(r"대학(\d+)학기", text):
        semesters.append(int(m.group(1)))

    if not semesters:
        return None, None

    def sem_to_grade(s: int) -> int:
        return max(1, (s + 1) // 2)

    grades = [sem_to_grade(s) for s in semesters]
    return min(grades), max(grades)


def parse_income(income_str: Any) -> Optional[int]:
    """
    소득분위 파싱
    예:
    - 8분위 이하 -> 8
    - 학자금 지원구간 5구간 이하 -> 5
    """
    text = clean_text(income_str)
    if not text:
        return None

    # 제한 없음 계열
    if any(word in text for word in ["제한없", "무관", "해당없", "없음"]):
        return None

    match = re.search(r"(\d+)\s*(?:분위|구간)", text)
    if match:
        val = int(match.group(1))
        if 0 <= val <= 10:
            return val

    return None


def parse_date(date_str: Any) -> Optional[str]:
    """
    날짜 파싱
    예:
    - 2026.04.01
    - 2026-04-01
    - 2026/04/01
    """
    text = clean_text(date_str)
    if not text:
        return None

    match = re.search(r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})", text)
    if match:
        year = match.group(1)
        month = match.group(2).zfill(2)
        day = match.group(3).zfill(2)
        return f"{year}-{month}-{day}"

    return None


def make_detail_url(title: str, provider: str, raw_url: Optional[str]) -> str:
    if raw_url:
        return raw_url
    query = requests.utils.quote(f"{title} {provider}")
    return f"https://search.naver.com/search.naver?query={query}"


# =========================
# 최신 API 엔드포인트 조회
# =========================

def get_latest_endpoint_uddi(api_key: str) -> str:
    """
    1순위: api-docs에서 UDDI 조회
    2순위: 공공데이터포털 페이지에서 UDDI 조회
    3순위: 환경변수 ENDPOINT_UDDI 사용
    """

    # 1차: api-docs에서 조회
    try:
        docs_url = "https://api.odcloud.kr/api/15028252/v1/api-docs"

        resp = requests.get(
            docs_url,
            headers={"Authorization": f"Infuser {api_key}"},
            timeout=15,
            verify=True
        )

        if resp.status_code == 200:
            paths = resp.json().get("paths", {})
            uddis = []

            for path in paths.keys():
                match = re.search(r"/uddi:([0-9a-fA-F\-]{36})", path)
                if match:
                    uddis.append(match.group(1))

            if uddis:
                return uddis[0]

    except Exception as e:
        print(f"[WARN] api-docs UDDI 조회 실패: {repr(e)}", flush=True)

    # 2차: 공공데이터포털 페이지에서 조회
    try:
        portal_url = "https://www.data.go.kr/data/15028252/openapi.do"

        resp = requests.get(
            portal_url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15,
            verify=True
        )

        if resp.status_code == 200:
            matches = re.findall(r"uddi:([0-9a-fA-F\-]{36})", resp.text)

            if matches:
                return matches[0]

    except Exception as e:
        print(f"[WARN] 공공데이터포털 UDDI 조회 실패: {repr(e)}", flush=True)

    # 3차: 환경변수 fallback
    if ENDPOINT_UDDI:
        print("[WARN] 환경변수 ENDPOINT_UDDI를 fallback으로 사용합니다.", flush=True)
        return ENDPOINT_UDDI

    raise ValueError("최신 UDDI를 찾을 수 없으며 ENDPOINT_UDDI도 없습니다.")


def refresh_endpoint(force: bool = False) -> str:
    global CURRENT_UDDI, CURRENT_BASE_URL

    if CURRENT_BASE_URL is not None and not force:
        return CURRENT_BASE_URL

    latest_uddi = get_latest_endpoint_uddi(API_KEY)
    CURRENT_UDDI = latest_uddi
    CURRENT_BASE_URL = f"https://api.odcloud.kr/api/15028252/v1/uddi:{latest_uddi}"

    print(f"[INFO] 최신 엔드포인트 반영: {CURRENT_BASE_URL}", flush=True)

    return CURRENT_BASE_URL


# =========================
# API 호출
# =========================

def fetch_page(page: int, per_page: int = 50) -> Tuple[Optional[List[Dict[str, Any]]], int]:
    """
    장학금 API 한 페이지 호출
    """
    base_url = refresh_endpoint()
    url = f"{base_url}?page={page}&perPage={per_page}"

    try:
        resp = requests.get(
            url,
            headers=headers,
            timeout=60,
            verify=True
        )

        # 엔드포인트 만료 가능성
        if resp.status_code in (404, 410):
            print(f"[WARN] 엔드포인트 만료 의심 status={resp.status_code} → 최신화 후 재시도", flush=True)

            base_url = refresh_endpoint(force=True)
            url = f"{base_url}?page={page}&perPage={per_page}"

            resp = requests.get(
                url,
                headers=headers,
                timeout=60,
                verify=True
            )

        if resp.status_code != 200:
            print(
                f"[ERROR] API 호출 실패: status={resp.status_code}, page={page}, body={resp.text[:300]}",
                flush=True
            )
            return None, 0

        body = resp.json()

        data = body.get("data", [])
        total_count = body.get("totalCount", 0)

        return data, total_count

    except Exception as e:
        print(f"[ERROR] page={page} 호출 중 예외: {repr(e)}", flush=True)
        return None, 0


# =========================
# 데이터 가공 및 저장
# =========================

def process_item(item: Dict[str, Any]) -> bool:
    """
    API item 하나를 scholarships 테이블에 upsert
    """

    start_date = parse_date(
        first_text(item, ["모집시작일", "신청시작일", "접수시작일"])
    )

    deadline = parse_date(
        first_text(item, ["모집종료일", "신청종료일", "접수종료일", "마감일"])
    )

    status = "unknown"
    is_open = False
    closed_reason = None

    if not deadline:
        status = "unknown"
        is_open = False
        closed_reason = "마감일 정보 없음"
    else:
        try:
            deadline_dt = date.fromisoformat(deadline)

            if deadline_dt < date.today():
                status = "closed"
                is_open = False
                closed_reason = "마감일 지남"
            else:
                status = "open"
                is_open = True
                closed_reason = None

        except ValueError:
            status = "unknown"
            is_open = False
            closed_reason = "마감일 파싱 실패"

    title = first_text(item, ["상품명", "장학금명", "공고명"]) or "이름없음"
    provider = first_text(item, ["운영기관명", "기관명", "제공기관명"]) or "기관미상"

    raw_gpa = first_text(item, ["성적기준", "성적기준 상세내용", "성적 기준"])
    raw_income = first_text(item, ["소득기준", "소득기준 상세내용", "소득 기준"])
    raw_grade = first_text(item, ["학년구분", "학년구분 상세내용", "학년"])
    raw_major = first_text(item, ["학과구분", "학과구분 상세내용", "전공"])
    raw_region = first_text(item, ["지역구분", "지역구분 상세내용", "지역"])
    raw_gender = first_text(item, ["성별제한", "성별구분", "성별"])

    min_gpa, gpa_scale = parse_gpa(raw_gpa)
    max_income = parse_income(raw_income)
    required_gender = parse_gender(raw_gender)
    min_grade, max_grade = parse_grade_range(raw_grade)

    selection_criteria = first_text(
        item,
        [
            "선발방법 상세내용",
            "선발방법",
            "선발기준",
            "선발기준 상세내용",
        ]
    )

    qualification = first_text(
        item,
        [
            "특정자격 상세내용",
            "특정자격",
            "자격요건",
            "지원자격",
            "지원자격 상세내용",
        ]
    )

    selection_count = first_text(
        item,
        [
            "선발인원",
            "선발인원 상세내용",
        ]
    )

    required_documents = first_text(
        item,
        [
            "제출서류",
            "제출서류 상세내용",
            "필요서류",
            "구비서류",
        ]
    )

    application_method = first_text(
        item,
        [
            "신청방법",
            "신청방법 상세내용",
            "접수방법",
        ]
    )

    contact_info = first_text(
        item,
        [
            "문의처",
            "문의처 상세내용",
            "연락처",
            "담당부서",
        ]
    )

    raw_url = first_text(
        item,
        [
            "홈페이지 주소",
            "홈페이지주소",
            "상세 URL",
            "상세URL",
            "공고 URL",
            "공고URL",
            "URL",
            "url",
        ]
    )

    detail_url = make_detail_url(title, provider, raw_url)

    scholarship_data = {
        "title": title,
        "provider": provider,

        "institution_type": first_text(item, ["운영기관구분"]),
        "product_type": first_text(item, ["상품구분"]),
        "aid_type": first_text(item, ["학자금유형구분", "학자금유형"]),
        "university_type": first_text(item, ["대학구분"]),

        "grade_type": raw_grade,
        "major_type": raw_major,

        "min_gpa": min_gpa,
        "gpa_scale": gpa_scale,
        "max_income_decile": max_income,
        "required_gender": required_gender,
        "min_grade": min_grade,
        "max_grade": max_grade,

        "start_date": start_date,
        "deadline": deadline,

        "status": status,
        "is_open": is_open,
        "closed_reason": closed_reason,

        "amount": first_text(
            item,
            [
                "지원금액",
                "지원내역",
                "지원내역 상세내용",
                "장학금액",
            ]
        ),

        # 핵심 수정 부분
        "selection_criteria": selection_criteria,
        "qualification": qualification,
        "selection_count": selection_count,
        "required_documents": required_documents,
        "application_method": application_method,
        "contact_info": contact_info,

        # 원문 조건 보존
        "raw_gpa_text": raw_gpa,
        "raw_income_text": raw_income,
        "raw_grade_text": raw_grade,
        "raw_major_text": raw_major,
        "raw_region_text": raw_region,

        # URL
        "source_url": detail_url,
        "detail_url": detail_url,

        # 원본 JSON 저장
        "raw_json": item,
    }

    # None 값 제거
    scholarship_data = {
        key: value
        for key, value in scholarship_data.items()
        if value is not None
    }

    try:
        supabase.table("scholarships").upsert(
            scholarship_data,
            on_conflict="title,provider"
        ).execute()

        print(f"  ✓ 저장/갱신: {title[:40]}", flush=True)
        return True

    except Exception as e:
        print(f"  ✗ [ERROR] 저장 실패 ({title[:30]}): {repr(e)}", flush=True)
        return False


def fetch_and_insert():
    """
    전체 장학금 수집 및 저장
    """
    refresh_endpoint(force=True)

    print(f"\n[INFO] 수집 시작 - 기준일: {date.today()}", flush=True)

    first_data, total_count = fetch_page(1, per_page=50)

    if not first_data:
        print("[WARN] 첫 페이지 데이터가 없습니다.", flush=True)
        return

    total_pages = math.ceil(total_count / 50)

    print(f"[INFO] 전체 데이터 수: {total_count}, 전체 페이지 수: {total_pages}", flush=True)

    saved_count = 0
    skipped_count = 0

    for item in first_data:
        if process_item(item):
            saved_count += 1
        else:
            skipped_count += 1

    for page in range(2, total_pages + 1):
        data_list, _ = fetch_page(page, per_page=50)

        if not data_list:
            print(f"[WARN] {page} 페이지 데이터 없음", flush=True)
            continue

        for item in data_list:
            if process_item(item):
                saved_count += 1
            else:
                skipped_count += 1

        print(
            f"[PROGRESS] {page}/{total_pages} 페이지 완료 | 저장 {saved_count}건 | 제외 {skipped_count}건",
            flush=True
        )

    print(
        f"✅ 수집 완료! 저장/갱신 {saved_count}건, 제외 {skipped_count}건",
        flush=True
    )


# =========================
# 조건검색용 함수
# =========================

def search_scholarships(
    keyword: Optional[str] = None,
    user_gpa: Optional[float] = None,
    income_decile: Optional[int] = None,
    grade: Optional[str] = None,
    major: Optional[str] = None,
    region: Optional[str] = None,
):
    """
    조건검색 테스트용 함수.
    실제 서비스에서는 FastAPI 또는 프론트에서 이 로직을 호출하면 됨.
    """

    query = supabase.table("scholarships").select("*")

    # 마감 안 지난 장학금만
    query = query.gte("deadline", str(date.today()))

    # 키워드 검색
    if keyword:
        query = query.or_(
            f"title.ilike.%{keyword}%,provider.ilike.%{keyword}%,qualification.ilike.%{keyword}%,selection_criteria.ilike.%{keyword}%"
        )

    # 성적 조건
    # min_gpa가 null이면 제한 없음으로 간주
    if user_gpa is not None:
        query = query.or_(
            f"min_gpa.is.null,min_gpa.lte.{user_gpa}"
        )

    # 소득분위 조건
    # max_income_decile이 null이면 제한 없음으로 간주
    if income_decile is not None:
        query = query.or_(
            f"max_income_decile.is.null,max_income_decile.gte.{income_decile}"
        )

    # 학년 조건
    if grade:
        query = query.or_(
            f"raw_grade_text.is.null,raw_grade_text.ilike.%{grade}%,raw_grade_text.ilike.%전체%,raw_grade_text.ilike.%무관%"
        )

    # 전공 조건
    if major:
        query = query.or_(
            f"raw_major_text.is.null,raw_major_text.ilike.%{major}%,raw_major_text.ilike.%전체%,raw_major_text.ilike.%무관%"
        )

    # 지역 조건
    if region:
        query = query.or_(
            f"raw_region_text.is.null,raw_region_text.ilike.%{region}%,raw_region_text.ilike.%전국%,raw_region_text.ilike.%무관%"
        )

    return query.order("deadline", desc=False).execute()


def make_match_reasons(scholarship: Dict[str, Any], user: Dict[str, Any]) -> List[str]:
    """
    추천 이유 생성용 함수.
    프론트에서 '왜 이 장학금이 추천됐는지' 보여주기 좋음.
    """

    reasons = []

    user_gpa = user.get("last_gpa")
    user_income = user.get("income_decile")
    user_grade = user.get("grade")
    user_major = user.get("major")
    user_region = user.get("region")

    min_gpa = scholarship.get("min_gpa")
    max_income = scholarship.get("max_income_decile")

    if min_gpa is None:
        reasons.append("성적 제한이 없거나 원문 기준 확인이 필요한 장학금입니다.")
    elif user_gpa is not None and user_gpa >= min_gpa:
        reasons.append(f"성적 조건 충족: 내 성적 {user_gpa} / 기준 {min_gpa} 이상")

    if max_income is None:
        reasons.append("소득분위 제한이 없거나 원문 기준 확인이 필요한 장학금입니다.")
    elif user_income is not None and user_income <= max_income:
        reasons.append(f"소득분위 조건 충족: 내 소득분위 {user_income} / 기준 {max_income}분위 이하")

    raw_grade = scholarship.get("raw_grade_text") or ""
    if user_grade and (
        user_grade in raw_grade
        or "전체" in raw_grade
        or "무관" in raw_grade
        or not raw_grade
    ):
        reasons.append("학년 조건이 일치하거나 제한이 없습니다.")

    raw_major = scholarship.get("raw_major_text") or ""
    if user_major and (
        user_major in raw_major
        or "전체" in raw_major
        or "무관" in raw_major
        or not raw_major
    ):
        reasons.append("전공 조건이 일치하거나 제한이 없습니다.")

    raw_region = scholarship.get("raw_region_text") or ""
    if user_region and (
        user_region in raw_region
        or "전국" in raw_region
        or "무관" in raw_region
        or not raw_region
    ):
        reasons.append("지역 조건이 일치하거나 제한이 없습니다.")

    return reasons


# =========================
# 실행
# =========================

if __name__ == "__main__":
    fetch_and_insert()

    # 3일마다 새벽 4시에 재수집
    schedule.every(3).days.at("04:00").do(fetch_and_insert)

    print("[INFO] 스케줄러 실행 중: 3일마다 04:00 수집", flush=True)

    while True:
        schedule.run_pending()
        time.sleep(60)