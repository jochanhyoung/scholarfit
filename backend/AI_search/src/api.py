from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
import time
import os
import logging
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

_required_env = ["OPENAI_API_KEY", "PROXY_SECRET"]
_missing = [k for k in _required_env if not os.getenv(k)]
if _missing:
    raise RuntimeError(f"필수 환경변수 누락: {', '.join(_missing)}")

from src.search import search_scholarship
from src.schemas import SearchRequest, ScholarshipResult, SearchResponse

logger = logging.getLogger("api")

app = FastAPI(title="ScholarFit AI Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://scholarfit.chosuncnl.cloud"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_limit: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 20
RATE_WINDOW = 60

PROXY_SECRET = os.getenv("PROXY_SECRET")


@app.middleware("http")
async def proxy_secret_middleware(request: Request, call_next):
    if request.url.path == "/search" and PROXY_SECRET:
        from fastapi.responses import JSONResponse
        if request.headers.get("X-Proxy-Secret") != PROXY_SECRET:
            return JSONResponse(status_code=403, content={"detail": "Forbidden"})
    return await call_next(request)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/search":
        ip = request.client.host
        now = time.time()
        window_start = now - RATE_WINDOW
        _rate_limit[ip] = [t for t in _rate_limit[ip] if t > window_start]
        if len(_rate_limit[ip]) >= RATE_LIMIT:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=429, content={"detail": "Too many requests"})
        _rate_limit[ip].append(now)
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest):
    user_info = {
        "grade": req.grade,
        "gpa": req.gpa,
        "income_decile": req.income_decile,
        "is_new": req.is_new,
        "region_id": req.region_id,
        "city": req.city,
        "district": req.district,
        "degree_level": req.degree_level,
        "gender": req.gender,
    }

    try:
        raw = search_scholarship(req.query, user_info)
    except Exception as e:
        logger.error("Search failed", exc_info=True)
        raise HTTPException(status_code=500, detail="검색 처리 중 오류가 발생했습니다.")

    results = []
    for item in raw:
        results.append(
            ScholarshipResult(
                scholarship_id=str(item.get("scholarship_id", "")),
                title=item.get("title", ""),
                organization=item.get("provider") or "",
                qualification=item.get("qualification") or "",
                amount=str(item.get("amount") or ""),
                deadline=str(item.get("deadline") or ""),
                required_docs=item.get("required_documents") or "",
                score=float(item.get("score", 0.0)),
                source_url=item.get("source_url") or None,
                ai_comment=item.get("ai_comment") or None,
            )
        )

    return SearchResponse(results=results)
