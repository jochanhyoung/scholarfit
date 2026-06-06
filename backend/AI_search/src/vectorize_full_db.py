import os
import json
import time
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from db import fetch_open_scholarships
from google.api_core import exceptions

load_dotenv(override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY 환경변수가 없습니다.")

genai.configure(api_key=GOOGLE_API_KEY)

BATCH_SIZE = 3
MAX_WAIT_TIME = 600

DATA_DIR = "/app/data"
VECTOR_PATH = f"{DATA_DIR}/open_scholarship_vectors.npy"
JSON_PATH = f"{DATA_DIR}/open_scholarship_data.json"


def build_embedding_text(scholarship: dict) -> str:
    parts = [
        f"장학금명: {scholarship.get('title') or ''}",
        f"운영기관: {scholarship.get('provider') or ''}",
        f"설명: {scholarship.get('description') or ''}",
        f"지원금액: {scholarship.get('amount') or ''}",
        f"지원자격: {scholarship.get('qualification') or ''}",
        f"선발기준: {scholarship.get('selection_criteria') or ''}",
        f"선발인원: {scholarship.get('selection_count') or ''}",
        f"제출서류: {scholarship.get('required_documents') or ''}",
        f"신청방법: {scholarship.get('application_method') or ''}",
        f"성적기준: {scholarship.get('raw_gpa_text') or ''}",
        f"소득기준: {scholarship.get('raw_income_text') or ''}",
        f"학년조건: {scholarship.get('raw_grade_text') or ''}",
        f"전공조건: {scholarship.get('raw_major_text') or ''}",
        f"지역조건: {scholarship.get('raw_region_text') or ''}",
        f"마감일: {scholarship.get('deadline') or ''}",
        f"모집상태: {scholarship.get('status') or ''}",
    ]

    return "\n".join(parts).strip()


def embed_batch_with_retry(batch_texts):
    wait_time = 60

    while True:
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=batch_texts,
                task_type="retrieval_document"
            )

            return result["embedding"]

        except exceptions.ResourceExhausted:
            print(f"⚠️ Quota exceeded! Sleeping for {wait_time} seconds...")
            time.sleep(wait_time)
            wait_time = min(wait_time * 2, MAX_WAIT_TIME)

        except Exception as e:
            error_text = str(e).lower()

            if "quota" in error_text or "429" in error_text or "rate" in error_text:
                print(f"⚠️ Rate limit detected! Sleeping for {wait_time} seconds...")
                time.sleep(wait_time)
                wait_time = min(wait_time * 2, MAX_WAIT_TIME)
            else:
                raise


def save_progress(all_scholarships, all_embeddings):
    os.makedirs(DATA_DIR, exist_ok=True)

    vectors = np.array(all_embeddings, dtype=np.float32)
    np.save(VECTOR_PATH, vectors)

    saved_scholarships = all_scholarships[:len(all_embeddings)]

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(saved_scholarships, f, ensure_ascii=False, indent=4, default=str)

    print(f"💾 Progress saved: {len(all_embeddings)} open scholarships")


def vectorize_open_scholarships():
    print("Step 1: Fetching currently open scholarships from Database...")

    all_scholarships = fetch_open_scholarships()

    if not all_scholarships:
        print("Error: No open scholarships found.")
        return

    print(f"Open scholarships found: {len(all_scholarships)}")

    combined_texts = [
        build_embedding_text(s)
        for s in all_scholarships
    ]

    print("Step 2: Vectorizing open scholarships with Rate Limit handling...")

    all_embeddings = []

    for i in range(0, len(combined_texts), BATCH_SIZE):
        batch = combined_texts[i:i + BATCH_SIZE]

        print(f"Processing {i} to {i + len(batch)}...")

        try:
            batch_embeddings = embed_batch_with_retry(batch)
            all_embeddings.extend(batch_embeddings)

            time.sleep(2)

            if len(all_embeddings) % 30 == 0:
                save_progress(all_scholarships, all_embeddings)

        except Exception as e:
            print(f"❌ Error while processing {i} to {i + len(batch)}: {e}")
            print("현재까지 진행한 결과를 저장합니다.")
            save_progress(all_scholarships, all_embeddings)
            return

    save_progress(all_scholarships, all_embeddings)

    print(f"🎉 Success! {len(all_embeddings)} open scholarships vectorized and saved!")
    print(f"Vector file: {VECTOR_PATH}")
    print(f"Data file: {JSON_PATH}")


if __name__ == "__main__":
    vectorize_open_scholarships()