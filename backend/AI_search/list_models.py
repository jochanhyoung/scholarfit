from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

print("--- 사용 가능한 모델 리스트 ---")
for m in client.models.list():
    if 'embed' in m.name.lower():
        print(f"모델명: {m.name}")
