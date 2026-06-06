import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from supabase import create_client, Client


# =========================
# 기본 설정
# =========================

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SESSION_SECRET_KEY = os.environ.get("SESSION_SECRET_KEY", "change-this-secret-key")

if not SUPABASE_URL:
    raise ValueError("환경변수 SUPABASE_URL이 없습니다.")

if not SUPABASE_KEY:
    raise ValueError("환경변수 SUPABASE_SERVICE_ROLE_KEY가 없습니다.")

if not GOOGLE_CLIENT_ID:
    raise ValueError("환경변수 GOOGLE_CLIENT_ID가 없습니다.")

if not GOOGLE_CLIENT_SECRET:
    raise ValueError("환경변수 GOOGLE_CLIENT_SECRET이 없습니다.")

if not GOOGLE_REDIRECT_URI:
    raise ValueError("환경변수 GOOGLE_REDIRECT_URI가 없습니다.")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False,  # 배포 시 HTTPS라면 True 권장
)


# =========================
# Google OAuth 설정
# =========================

oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    },
)


# =========================
# DB 유틸
# =========================

def get_user_by_email(email: str) -> Optional[dict]:
    result = (
        supabase.table("users")
        .select("*")
        .eq("email", email)
        .limit(1)
        .execute()
    )

    if result.data:
        return result.data[0]

    return None


def create_or_update_google_user(
    email: str,
    name: Optional[str],
    profile_image: Optional[str],
    provider_user_id: str,
    access_token: Optional[str],
    refresh_token: Optional[str],
) -> dict:
    existing_user = get_user_by_email(email)

    if existing_user:
        user_id = existing_user["user_id"]

        supabase.table("users").update({
            "name": name,
            "profile_image": profile_image,
            "provider": "google",
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("user_id", user_id).execute()

    else:
        inserted = supabase.table("users").insert({
            "email": email,
            "name": name,
            "profile_image": profile_image,
            "provider": "google",
        }).execute()

        if not inserted.data:
            raise HTTPException(status_code=500, detail="사용자 생성 실패")

        user_id = inserted.data[0]["user_id"]

    oauth_payload = {
        "user_id": user_id,
        "provider": "google",
        "provider_user_id": provider_user_id,
        "email": email,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "updated_at": datetime.utcnow().isoformat(),
    }

    supabase.table("user_oauth").upsert(
        oauth_payload,
        on_conflict="provider,provider_user_id"
    ).execute()

    user_result = (
        supabase.table("users")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    return user_result.data[0]


# =========================
# 라우터
# =========================

@app.get("/")
def root():
    return {
        "message": "Scholarship API server is running"
    }


@app.get("/auth/google/login")
async def google_login(request: Request):
    """
    프론트에서 이 주소로 이동시키면 구글 로그인 화면으로 넘어감.
    """
    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI
    )


@app.get("/auth/google/callback")
async def google_callback(request: Request):
    """
    구글 로그인 성공 후 돌아오는 주소.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"구글 로그인 토큰 처리 실패: {repr(e)}"
        )

    user_info = token.get("userinfo")

    if not user_info:
        user_info = await oauth.google.userinfo(token=token)

    email = user_info.get("email")
    name = user_info.get("name")
    profile_image = user_info.get("picture")
    provider_user_id = user_info.get("sub")

    if not email or not provider_user_id:
        raise HTTPException(
            status_code=400,
            detail="구글 계정 정보를 가져오지 못했습니다."
        )

    user = create_or_update_google_user(
        email=email,
        name=name,
        profile_image=profile_image,
        provider_user_id=provider_user_id,
        access_token=token.get("access_token"),
        refresh_token=token.get("refresh_token"),
    )

    request.session["user_id"] = user["user_id"]
    request.session["email"] = user["email"]

    return RedirectResponse(
        url=f"{FRONTEND_URL}/login/success?user_id={user['user_id']}"
    )


@app.get("/me")
def get_me(request: Request):
    """
    현재 로그인한 사용자 확인용.
    """
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    result = (
        supabase.table("users")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return result.data[0]


@app.post("/logout")
def logout(request: Request):
    request.session.clear()

    return {
        "message": "로그아웃되었습니다."
    }