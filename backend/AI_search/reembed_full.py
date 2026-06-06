import json
import numpy as np
import os
import time
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBED_MODEL = "text-embedding-3-large"
BATCH_SIZE = 100
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def build_content(s):
    parts = [
        s.get("title", ""),
        s.get("provider", ""),
        s.get("institution_type", ""),
        s.get("aid_type", ""),
        s.get("grade_type", ""),
    ]
    if s.get("min_gpa"):
        parts.append(f"최소 성적 {s['min_gpa']}")
    if s.get("max_income_decile"):
        parts.append(f"소득분위 {s['max_income_decile']}분위 이하")
    if s.get("amount"):
        parts.append(s["amount"])
    if s.get("required_gender"):
        parts.append(f"성별 {s['required_gender']}")
    if s.get("qualification"):
        parts.append(s["qualification"])
    return " ".join(p for p in parts if p)


def reembed_full():
    json_path = os.path.join(BASE_DIR, "data", "scholarship_data.json")
    vector_path = os.path.join(BASE_DIR, "full_scholarship_vectors.npy")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"전체 장학금 {len(data)}개에 대해 임베딩을 시작합니다... (모델: {EMBED_MODEL})")

    contents = [build_content(s) for s in data]

    all_embeddings = []
    for batch_start in range(0, len(contents), BATCH_SIZE):
        batch = contents[batch_start:batch_start + BATCH_SIZE]
        response = client.embeddings.create(
            model=EMBED_MODEL,
            input=batch,
        )
        batch_embeddings = [item.embedding for item in sorted(response.data, key=lambda x: x.index)]
        all_embeddings.extend(batch_embeddings)

        processed = min(batch_start + BATCH_SIZE, len(contents))
        print(f"진행: {processed}/{len(contents)}")

        if processed < len(contents):
            time.sleep(0.5)

    vectors = np.array(all_embeddings)
    np.save(vector_path, vectors)
    print(f"완료! full_scholarship_vectors.npy 저장 (개수: {vectors.shape[0]}개, 차원: {vectors.shape[1]})")


if __name__ == "__main__":
    reembed_full()
