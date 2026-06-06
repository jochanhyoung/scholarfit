import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "supabase-db"),
            database=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT", "5432")
        )
        return conn

    except Exception as e:
        print(f"DB 연결 오류: {e}")
        return None


def fetch_all_scholarships():
    """
    데이터베이스에서 모든 장학금 정보를 가져오는 함수
    """
    conn = get_db_connection()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM public.scholarships;"
            cur.execute(query)
            results = cur.fetchall()
            return results
    finally:
        conn.close()


def fetch_open_scholarships():
    """
    현재 신청 가능한 장학금만 가져오는 함수
    is_open = true 인 데이터만 조회
    """
    conn = get_db_connection()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
                SELECT *
                FROM public.scholarships
                WHERE is_open = true
                ORDER BY deadline ASC;
            """
            cur.execute(query)
            results = cur.fetchall()
            return results
    finally:
        conn.close()