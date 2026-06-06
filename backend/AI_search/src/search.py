import json
import os
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_openai_api_key = os.getenv("OPENAI_API_KEY")
if not _openai_api_key:
    raise ValueError("환경변수 OPENAI_API_KEY가 없습니다.")
openai_client = OpenAI(api_key=_openai_api_key)

EMBED_MODEL = "text-embedding-3-large"
EXPAND_MODEL = "o1-mini"
RANK_MODEL = "gpt-4o"
REGION_EXACT_BOOST = 0.15
TOP_K_RERANK = 20

_QUERY_EXPAND_PROMPT = """당신은 장학금 검색 전문가입니다.
사용자의 검색어를 장학금 데이터베이스에서 유사도 검색에 최적화된 형태로 변환하세요.
- 핵심 키워드를 추출하고 관련 장학금 용어를 추가하세요
- 약어나 구어체를 정식 용어로 확장하세요
- 자격 요건 추론: 성적, 소득, 지역, 전공 등 관련 조건도 포함하세요
- 50단어 이내로 간결하게 작성하세요
- 오직 변환된 검색어만 출력하세요 (설명 없이)

검색어: """


def _load_assets() -> tuple[list, np.ndarray]:
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    active_json = os.path.join(base, "active_scholarship_data.json")
    active_vectors = os.path.join(base, "active_scholarship_vectors.npy")

    if not (os.path.exists(active_json) and os.path.exists(active_vectors)):
        raise FileNotFoundError(
            "active_scholarship_data.json 또는 active_scholarship_vectors.npy 파일이 없습니다. "
            "generate_vectors.py를 먼저 실행하세요."
        )

    with open(active_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    vectors = np.load(active_vectors)

    if vectors.ndim != 2 or vectors.shape[1] != 3072:
        raise ValueError(
            f"벡터 차원 불일치: {vectors.shape[1]}차원 (text-embedding-3-large는 3072차원). "
            "generate_vectors.py로 벡터를 재생성하세요."
        )

    return data, vectors


_ALL_DATA, _ALL_VECTORS = _load_assets()


def _refine_query(query: str) -> str:
    """o1-mini로 쿼리 확장 및 자격 요건 추론."""
    try:
        response = openai_client.chat.completions.create(
            model=EXPAND_MODEL,
            messages=[
                {"role": "user", "content": _QUERY_EXPAND_PROMPT + query},
            ],
            max_completion_tokens=300,
        )
        refined = response.choices[0].message.content.strip()
        return refined if refined else query
    except Exception as e:
        print(f"[QueryExpand] o1-mini failed, using raw query: {e}")
        return query


def _rerank_and_comment(candidates: list[dict], query: str, user_info: dict) -> list[dict]:
    """gpt-4o 단일 배치 호출로 리랭킹 + ai_comment 생성."""
    if not candidates:
        return candidates

    scholarships_text = "\n".join([
        f"[{i + 1}] ID:{s['scholarship_id']} | 제목:{s['title']} | 제공:{s.get('provider', '')} | "
        f"금액:{s.get('amount', '')} | 마감:{s.get('deadline', '')} | "
        f"자격:{(s.get('qualification') or '')[:200]}"
        for i, s in enumerate(candidates)
    ])

    system_prompt = "당신은 장학금 추천 전문가입니다. 사용자 정보와 검색 의도를 분석하여 최적의 장학금을 추천합니다."
    user_prompt = f"""사용자가 '{query}'로 장학금을 검색했습니다.

사용자 정보:
- 학년: {user_info.get('grade')}학년
- 학점: {user_info.get('gpa')}
- 소득분위: {user_info.get('income_decile')}분위
- 성별: {user_info.get('gender', '미입력')}
- 학위과정: {user_info.get('degree_level', '학부')}

아래 장학금 후보들을 이 사용자에게 가장 적합한 순서로 재정렬하고,
각 장학금이 왜 이 사용자에게 적합한지 자연스러운 한국어 2-3문장으로 설명하세요.

장학금 목록:
{scholarships_text}

반드시 아래 JSON 배열 형식으로만 응답하세요 (앞뒤 설명 없이):
[
  {{"id": "장학금_ID", "rank": 1, "ai_comment": "추천 이유 2-3문장"}},
  {{"id": "장학금_ID", "rank": 2, "ai_comment": "추천 이유 2-3문장"}},
  ...
]"""

    try:
        response = openai_client.chat.completions.create(
            model=RANK_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=2048,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        response_text = response.choices[0].message.content.strip()

        parsed = json.loads(response_text)
        # gpt-4o with json_object may wrap array in a key
        if isinstance(parsed, dict):
            ranked = next(iter(parsed.values()))
        else:
            ranked = parsed

        id_to_comment = {str(item['id']): item.get('ai_comment', '') for item in ranked}
        id_to_rank = {str(item['id']): item.get('rank', 999) for item in ranked}

        for s in candidates:
            sid = str(s['scholarship_id'])
            s['ai_comment'] = id_to_comment.get(sid, '')
            s['_gpt_rank'] = id_to_rank.get(sid, 999)

        return sorted(candidates, key=lambda x: x.get('_gpt_rank', 999))

    except Exception as e:
        print(f"[Rerank] gpt-4o reranking failed: {e}")
        for s in candidates:
            s.setdefault('ai_comment', '')
        return candidates


def search_scholarship(query: str, user_info: dict) -> list[dict]:
    from src.filter_logic import hard_filter, city_to_keyword, matches_city

    filtered_data, filtered_vectors = hard_filter(_ALL_DATA, _ALL_VECTORS, user_info)
    if not filtered_data:
        return []

    refined_query = _refine_query(query)

    query_response = openai_client.embeddings.create(
        model=EMBED_MODEL,
        input=refined_query,
    )
    query_vector = np.array(query_response.data[0].embedding)

    norms = np.linalg.norm(filtered_vectors, axis=1) * np.linalg.norm(query_vector)
    norms = np.where(norms == 0, 1e-10, norms)
    similarities = np.dot(filtered_vectors, query_vector) / norms

    city_kw = city_to_keyword(user_info.get('city') or '')
    district = user_info.get('district') or ''

    candidates = []
    for idx in range(len(filtered_data)):
        s = filtered_data[idx]
        score = float(similarities[idx])
        if city_kw:
            text = (s.get('provider') or '') + ' ' + (s.get('title') or '')
            if matches_city(text, city_kw, district):
                score += REGION_EXACT_BOOST

        candidates.append({
            "scholarship_id": s['scholarship_id'],
            "title": s['title'],
            "provider": s.get('provider'),
            "score": score,
            "amount": s.get('amount', 0),
            "deadline": s.get('deadline', '9999-12-31'),
            "required_documents": s.get('required_documents', ''),
            "source_url": s.get('source_url', ''),
            "selection_count": s.get('selection_count', ''),
            "qualification": s.get('qualification', ''),
            "ai_comment": "",
        })

    candidates.sort(key=lambda x: x['score'], reverse=True)

    top = candidates[:TOP_K_RERANK]
    rest = candidates[TOP_K_RERANK:]

    reranked = _rerank_and_comment(top, query, user_info)

    return reranked + rest
