import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

COLUMNS = [
    "scholarship_id", "title", "provider", "institution_type",
    "product_type", "aid_type", "university_type", "grade_type",
    "major_type", "min_grade", "max_grade", "min_gpa", "gpa_scale",
    "max_income_decile", "required_gender", "required_region_id",
    "start_date", "deadline", "amount", "selection_count",
    "required_documents", "source_url", "detail_url", "region_id",
    "selection_criteria", "qualification", "application_method",
    "contact_info", "raw_gpa_text", "raw_income_text",
    "raw_grade_text", "raw_major_text", "raw_region_text",
    "status", "is_open",
]

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "data", "scholarship_data.json")


def export():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "supabase-db"),
        dbname=os.getenv("DB_NAME", "postgres"),
        user=os.getenv("DB_USER", "ai_search_ro"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", 5432),
    )

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f"SELECT {', '.join(COLUMNS)} FROM public.scholarships ORDER BY scholarship_id")
        rows = cur.fetchall()

    conn.close()

    data = []
    for row in rows:
        item = dict(row)
        if item.get("start_date"):
            item["start_date"] = item["start_date"].strftime("%Y-%m-%d")
        if item.get("deadline"):
            item["deadline"] = item["deadline"].strftime("%Y-%m-%d")
        data.append(item)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"완료: {len(data)}개 → {OUTPUT_PATH}")


if __name__ == "__main__":
    export()
