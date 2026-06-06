import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_api_key = os.getenv("OPENAI_API_KEY")
if not _api_key:
    raise ValueError("환경변수 OPENAI_API_KEY가 없습니다.")
client = OpenAI(api_key=_api_key)

MODEL = "gpt-4o"

_SYSTEM_PROMPT = """당신은 장학금 자기소개서 첨삭 전문가입니다.
지원자의 잠재력을 최대한 이끌어내는 따뜻하고 구체적인 피드백을 제공합니다.
반드시 아래 마크다운 형식을 정확히 지켜 응답하세요."""


def analyze_resume(resume_text: str, scholarship_title: str = None) -> str:
    scholarship_context = (
        f"지원 장학금: **{scholarship_title}**\n"
        f"이 장학금의 취지와 특성에 맞춰 첨삭해주세요.\n\n"
        if scholarship_title
        else "특정 장학금 미지정 — 일반적인 장학금 자소서 기준으로 첨삭해주세요.\n\n"
    )

    user_prompt = f"""{scholarship_context}아래 자기소개서를 분석하고 다음 형식으로 첨삭해주세요.

---

## [총평]
자소서의 전반적인 방향성과 잘 쓴 점을 따뜻하고 고무적인 어조로 서술하세요.

## [개선 필요 사항]
논리적 흐름이 어색하거나 장학금 취지에 맞지 않는 부분을 구체적으로 지적하세요.

## [문장별 교정 레시피]
어색한 표현을 아래 형식으로 명확하게 비교해주세요.
- **Before** ➔ **After**: 교정 이유 한 줄

## [최종 모범 수정안]
흐름과 맞춤법을 완벽하게 다듬은 전체 수정 자소서를 작성해주세요.

---

**[자기소개서 원문]**
{resume_text}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=3000,
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()


if __name__ == "__main__":
    sample_resume = """
    저는 어릴때부터 컴퓨터에 관심이 많았습니다. 그래서 소프트웨어학과에 진학했고
    열심히 공부하고 있습니다. 장학금을 받으면 더욱 더 공부에 집중할 수 있을것 같아서
    지원하게 됬습니다. 앞으로도 최선을 다할 것을 약속드립니다.
    """

    result = analyze_resume(
        resume_text=sample_resume,
        scholarship_title="미래인재 IT 장학금"
    )
    print(result)
