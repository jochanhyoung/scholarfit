<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3ECF8E,100:1a7a56&height=200&section=header&text=ScholarFit&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=데이터%20기반%20통합%20장학금%20필터링%20플랫폼&descAlignY=58&descSize=18&descColor=c8f5e3" />

<br>

[![Service](https://img.shields.io/badge/🌐_Live_Service-scholarfit.chosuncnl.cloud-3ECF8E?style=for-the-badge&labelColor=1a1a2e)](https://scholarfit.chosuncnl.cloud/)
[![Figma](https://img.shields.io/badge/🎨_Wireflow-Figma-F24E1E?style=for-the-badge&labelColor=1a1a2e)](https://www.figma.com/design/D9xupjqJyLqWqTndzPDSeB/Wireflow?node-id=0-1)
[![Stars](https://img.shields.io/github/stars/jochanhyoung/scholarfit?style=for-the-badge&labelColor=1a1a2e&color=FFD700)](https://github.com/jochanhyoung/scholarfit)

<br>

> **흩어진 장학 공고를 모으고, 학생별 자격을 판정하여**
> ***검색*에서 *실제 지원*으로 이어지게 만드는 대학 친화형 플랫폼**

<br>

</div>

---

## 📑 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [사용자 설문 결과](#-사용자-설문-결과-n38)
3. [팀 소개](#-팀-소개)
4. [기술 스택](#️-기술-스택)
5. [시스템 아키텍처](#️-시스템-아키텍처)
6. [핵심 기능](#-핵심-기능)
7. [디렉터리 구조](#-디렉터리-구조)
8. [시작하기](#-시작하기)
9. [추진 일정 & KPI](#️-추진-일정--kpi)
10. [트러블슈팅](#-트러블슈팅)
11. [사용자 피드백](#-사용자-피드백)

---

## 🎯 프로젝트 소개

### 문제 정의

장학 정보는 **공공기관 · 대학 · 지자체 · 민간** 4곳에 분산되어 있습니다.
학생은 자신에게 맞는 장학금을 찾기 위해 여러 사이트를 반복 방문해야 하며, 마감일을 놓치는 일도 빈번합니다.

<div align="center">

| 순위 | 기존 방식의 불편 사항 | 응답률 |
|:---:|---|:---:|
| 🥇 | 여러 사이트를 일일이 돌아다니며 검색해야 함 | **71.8%** |
| 🥈 | 내 조건에 맞는 장학금인지 파악이 복잡함 | **64.1%** |
| 🥉 | 공고를 늦게 확인해 마감일을 놓침 | **41.0%** |
| 4위 | 자기소개서 작성이 막막하고 첨삭 받을 곳 없음 | **20.5%** |

*설문조사 n=39, 복수응답 허용*

</div>

<br>

### 해결 방안

<table>
<tr>
<td width="25%" align="center">

**🔍**<br>**통합 탐색**

</td>
<td>공공 · 교내 · 지자체 · 민간 공고를 <b>하나의 스키마</b>로 통합하여 단일 화면에서 탐색</td>
</tr>
<tr>
<td align="center">

**🤖**<br>**설명가능 추천**

</td>
<td>규칙 엔진 + LLM 보조 해석으로 <b>"왜 추천되었는지"</b> 근거 문장과 함께 제공</td>
</tr>
<tr>
<td align="center">

**📅**<br>**행동 전환**

</td>
<td>추천 → 체크리스트 → <b>Google Calendar 등록</b>까지 끊김 없는 지원 흐름</td>
</tr>
<tr>
<td align="center">

**🛡️**<br>**신뢰 설계**

</td>
<td>원문 링크 · 업데이트 시각 · 근거 문장 · <b>신뢰 등급</b> 제공으로 할루시네이션 방지</td>
</tr>
</table>

---

## 📊 사용자 설문 결과 (n=38)

> 2026년 5월, 6개 대학교 재학생 대상 실사용 UX 테스트 진행

<br>

### ⏱️ 탐색 시간 비교

```
기존 방식으로 장학금 찾기까지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10분 미만       ████░░░░░░░░░░░░░░░░░░░░   15.8%
10분 ~ 30분     ████████████░░░░░░░░░░░░   26.3%
30분 ~ 1시간    ██████░░░░░░░░░░░░░░░░░░   18.4%
1시간 이상       ████░░░░░░░░░░░░░░░░░░░░   10.5%
여러 날에 걸쳐   ████████████░░░░░░░░░░░░   26.3%

스칼라핏으로 장학금 찾기까지
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1분 미만        ██████████████████████     36.8% ✅
1분 ~ 3분       █████████████████████████  42.1% ✅
3분 ~ 5분       ████████░░░░░░░░░░░░░░░░   15.8%
5분 이상         ██░░░░░░░░░░░░░░░░░░░░░░    5.3%

→ 78.9% 가 3분 이내 발견 완료
```

<br>

### ⭐ 시간 단축 체감 점수 (5점 만점)

```
5점  ████████████████████████████████████████  63.2%  (24명)
4점  ████████████████████░░░░░░░░░░░░░░░░░░░░  28.9%  (11명)
3점  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5.3%   ( 2명)
1점  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   2.6%   ( 1명)

                                  평균 4.50 / 5.00
                              4~5점 응답률: 92.1% ✨
```

<br>

### 🏆 시간 단축에 가장 큰 도움이 된 기능 (1순위)

| 기능 | 응답수 | 비율 |
|---|:---:|:---:|
| 🥇 프로필 맞춤 필터링 (성적·소득으로 부적합 자동 제거) | 20명 | **52.6%** |
| 🥈 통합 검색 (흩어진 공고를 한 사이트에서) | 12명 | **31.6%** |
| 🥉 카드형 UI (핵심 정보만 요약 표시) | 5명 | **13.2%** |
| 4위 Google Calendar 등록 기능 | 1명 | **2.6%** |

<br>

### 🤖 AI 자소서 첨삭 기능 추가 시 활용 의향

| 응답 | 비율 |
|---|:---:|
| 매우 적극적으로 사용할 것이다 | 39.5% |
| 상황에 따라 사용할 것이다 | 57.9% |
| 사용하지 않을 것 같다 | 2.6% |

> **97.4%** 가 긍정적 활용 의사 표명

<br>

### 🏫 참여 대학 분포

| 대학교 | 응답 수 |
|---|:---:|
| 조선대학교 | 31명 |
| 중앙대학교 | 4명 |
| 서울대학교 · 영남대학교 · 한국외국어대학교 · 인하대학교 | 각 1명 |

---

## 👥 팀 소개

<div align="center">

<table>
<tr>
<th width="22%">조찬형 (팀장)</th>
<th width="22%">강휘민</th>
<th width="22%">한고은</th>
<th width="22%">여수연</th>
</tr>
<tr>
<td align="center"><sub>20213061</sub></td>
<td align="center"><sub>20213075</sub></td>
<td align="center"><sub>20233132</sub></td>
<td align="center"><sub>20233063</sub></td>
</tr>
<tr>
<td align="center">

**프로젝트 총괄**

API · AI 리드<br>
사용자 화면 설계<br>
규칙 엔진 / 자소서 첨삭

</td>
<td align="center">

**인프라 · 배포**

OpenStack<br>
Nginx · CI/CD<br>
모니터링 · 장애 대응

</td>
<td align="center">

**DB · 데이터 · 인증**

DB 설계<br>
API 연동 · 데이터 수집<br>
Google OAuth · Calendar

</td>
<td align="center">

**서비스 · UX**

추천 플로우<br>
필터링 로직<br>
검색 엔진

</td>
</tr>
</table>

<sub>🏫 조선대학교 AI소프트웨어학부 산학프로젝트1 · 2026</sub>

</div>

---

## 🛠️ 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Backend & AI
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-00ADD8?style=flat-square&logo=go&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_Embeddings-4285F4?style=flat-square&logo=google&logoColor=white)

### Database & Storage
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy_.npy_Vectors-013243?style=flat-square&logo=numpy&logoColor=white)

### Data Collection
![BeautifulSoup4](https://img.shields.io/badge/BeautifulSoup4-43B02A?style=flat-square)
![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=flat-square&logo=selenium&logoColor=white)
![Cron](https://img.shields.io/badge/Cron_Scheduler-000000?style=flat-square)

### Infrastructure & DevOps
![OpenStack](https://img.shields.io/badge/OpenStack-ED1944?style=flat-square&logo=openstack&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![GitLab CI](https://img.shields.io/badge/GitLab_CI-FC6D26?style=flat-square&logo=gitlab&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=flat-square&logo=argo&logoColor=white)
![Harbor](https://img.shields.io/badge/Harbor-60B932?style=flat-square&logo=harbor&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?style=flat-square&logo=ansible&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)

### Observability & Quality
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)
![Loki](https://img.shields.io/badge/Loki-F46800?style=flat-square&logo=grafana&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=flat-square&logo=sonarqube&logoColor=white)

---

## 🏗️ 시스템 아키텍처

### AI 추천 파이프라인

```
📥 수집          🔄 구조화         ⚙️ 판정           💬 설명          🚀 행동
━━━━━━━━━━━    ━━━━━━━━━━━━    ━━━━━━━━━━━━    ━━━━━━━━━━━    ━━━━━━━━━━━━
크롤링           공통 스키마       규칙 엔진          RAG             체크리스트
BS4/Selenium   정규화            + GPT-4o          근거 문장         캘린더 등록
Cron 스케줄     PostgreSQL       reranking         신뢰 등급         알림 발송
```

### 2단계 판정 엔진

```
┌──────────────────────────────────────────────────────────┐
│  1️⃣ 규칙 엔진 (Rule-based)                                │
│                                                          │
│  GPA · 학년 · 지역 · 소득구간 · 전공                        │
│  → 즉시 판정: ✅ 지원가능 / ❓ 검토필요 / ❌ 부적합           │
└──────────────────────────┬───────────────────────────────┘
                           ↓ 검토필요 케이스
┌──────────────────────────────────────────────────────────┐
│  2️⃣ LLM 보조 해석 (GPT-4o reranking)                     │
│                                                          │
│  예외 조항 · 우대 문구 · 서술형 자격 조건                     │
│  Gemini gemini-embedding-001 (3072-dim) 코사인 유사도      │
│  + 지역 보너스 (+0.15) 적용                                │
│  → 환각 방지: "검토 필요" 상태 분리 유지                      │
└──────────────────────────────────────────────────────────┘
```

### 환경 분리

<table>
<tr>
<th width="50%">🧪 Dev 환경</th>
<th width="50%">🚀 Ops 환경</th>
</tr>
<tr>
<td align="center">
<img src="docs/images/KakaoTalk_20260527_201412117.png" alt="Dev Architecture" width="100%">
</td>
<td align="center">
<img src="docs/images/KakaoTalk_20260527_195512413_02.png" alt="Ops Architecture" width="100%">
</td>
</tr>
<tr>
<td>

**Docker Compose 기반**
- Vite + React (Frontend)
- FastAPI + Node.js (Backend)
- OpenAI + Gemini (AI)
- Supabase + PostgreSQL
- 빠른 빌드 & 배포 우선

</td>
<td>

**Kubernetes 기반**
- GitLab CI → ArgoCD → K8s
- Harbor (Image Registry)
- Ingress-nginx + Service
- Grafana + Prometheus + Loki
- 자동 복구 & 무중단 배포

</td>
</tr>
</table>

<details>
<summary><b>📡 네트워크 흐름 자세히 보기</b></summary>

**개발 환경**
```
Client → DNS → OpenStack Nginx (Reverse Proxy)
       → VM IP : External Port
       → Container : Inner Port
```

**운영 환경**
```
Client → DNS → OpenStack Nginx (Reverse Proxy)
       → Node IP : NodePort
       → kube-proxy (L4 LB)
       → Ingress-nginx (L7 Router)
       → Service → Pod → Application
```

</details>

---

## 🌐 인프라 서비스

조선대학교 사설 클라우드 (`*.chosuncnl.cloud`) 위에 구축된 운영 인프라

| 서비스 | 용도 | 링크 |
|:---:|---|:---:|
| 🌥️ **OpenStack** | 프라이빗 클라우드 플랫폼 | [↗](https://chosuncnl.cloud/) |
| 🎓 **ScholarFit** | 메인 서비스 | [↗](https://scholarfit.chosuncnl.cloud/) |
| 🗄️ **Supabase** | DB + Auth (BaaS) | [↗](https://supabase.chosuncnl.cloud/) |
| 🔍 **SonarQube** | 정적 코드 분석 | [↗](https://sonar.chosuncnl.cloud/) |
| 📊 **Grafana** | 모니터링 (+ Prometheus, Loki) | [↗](https://grafana.chosuncnl.cloud/) |
| 🚀 **ArgoCD** | GitOps 자동 배포 | [↗](https://argo-cd.chosuncnl.cloud/) |
| 📦 **Harbor** | Container Image Registry | [↗](https://harbor.chosuncnl.cloud/) |
| 📜 **Dozzle** | 실시간 Log Viewer | [↗](https://dozzle.chosuncnl.cloud/) |
| 🔔 **Alert** | 알림 서비스 | [↗](https://alert.chosuncnl.cloud/) |

---

## ✨ 핵심 기능

| 기능 | 설명 |
|---|---|
| 👤 **프로필 온보딩** | 학년 · 성적 · 거주지 · 소득구간 · 전공 · 희망 장학 유형을 1회 입력 |
| 📥 **공고 통합 수집** | 공식 · 교내 · 지자체 · 민간 공고를 공통 스키마로 자동 정규화 |
| 🤖 **AI 요건 해석** | 명시 조건은 규칙 기반, 서술형은 LLM 보조 → `지원가능 / 검토필요 / 부적합` |
| 🏆 **추천 · 랭킹** | 코사인 유사도 + 지역 보너스 + GPT-4o reranking 종합 점수화 |
| 📅 **일정 · 알림** | D-7 / D-3 / D-1 / D-Day Google Calendar 자동 등록 |
| ✍️ **AI 자소서 첨삭** | GPT-4o-mini 기반 어색한 문장 지적 및 수정안 제안 |
| 🛠️ **관리자 대시보드** | 수집 상태 · 오류 감지 · 수동 보정 · 우선 노출 |

---

## 📁 디렉터리 구조

```
📦 team-01-main
 ┣ 📂 backend
 ┃ ┣ 📂 AI_search          # FastAPI AI 추천 엔진 (Gemini 임베딩, GPT-4o reranking)
 ┃ ┗ 📂 ...
 ┣ 📂 frontend             # React + Vite + TypeScript
 ┃ ┗ 📂 src/
 ┣ 📂 supabase
 ┃ ┣ 📂 docker/            # Self-hosted Supabase (Docker Compose)
 ┃ ┗ 📂 supabase/          # Migrations, Edge Functions, Seed
 ┣ 📂 docs                 # 아키텍처 이미지, 문서
 ┣ 📂 scripts              # 유틸 스크립트
 ┣ 📂 exec                 # SQL 초기화 스크립트
 ┣ 🐳 docker-compose.yml
 ┗ 📄 PROJECT_REPORT.md
```

---

## 🚀 시작하기

### 사전 요구사항

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+

### 환경 변수 설정

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 각 .env 파일에 API 키 및 Supabase URL 입력
```

### 실행

```bash
# 전체 서비스 실행
docker compose up -d

# 프론트엔드 개발 서버
cd frontend && npm install && npm run dev

# AI 백엔드
cd backend/AI_search && pip install -r requirements.txt && uvicorn main:app --reload
```

---

## 🗓️ 추진 일정 & KPI

### 12주 스프린트

| 주차 | 작업 패키지 | 담당 |
|:---:|---|:---:|
| `W1` | 요구사항 정제 · 정보원 목록화 | 찬형 · 휘민 |
| `W1–W2` | DB 스키마 · API 명세 | 고은 · 찬형 |
| `W2–W4` | 수집기 · 정규화 파이프라인 | 휘민 · 고은 |
| `W3–W6` | AI 추출 · 매칭 엔진 | 찬형 · 수연 |
| `W4–W7` | UI/UX · 프로필 온보딩 | 수연 · 찬형 |
| `W6–W8` | 일정 연동 · 알림 | 고은 |
| `W7–W10` | 관제 · 품질 · 배포 | 휘민 |
| `W10–W12` | 통합 테스트 · 파일럿 피드백 | 전체 |

### 평가 지표 (KPI)

| 영역 | 목표 | 실측 결과 |
|---|---|:---:|
| 📊 공고 구조화 정확도 | F1 `0.90` 이상 | - |
| ✅ 자격 판정 일치도 | `85%` 이상 | - |
| ⚡ 추천 응답 속도 (P95) | `1.0초` 이하 | - |
| 🔔 알림 성공률 | `99%` 이상 | - |
| 🔄 데이터 최신성 | `6시간` 이내 갱신 | - |
| ⭐ 사용자 만족도 | `4.2 / 5.0` 이상 | **4.50 / 5.0** ✅ |

---

## 🐛 트러블슈팅

<details>
<summary>🎨 <b>Frontend</b></summary>

<br>

**신입생 선택 시 저장 버튼이 안 뜨는 버그**
- 신입생은 성적 입력 단계를 건너뛰는데, 이때 저장 버튼이 함께 사라짐
- → 신입생의 경우 별도 분기로 저장 버튼이 표시되도록 처리

**성적 입력 검증 미흡**
- 만점 초과 입력 차단
- 어학 성적은 점수 직접 입력 대신 **등급 선택** 방식으로 변경
- 음수 / 과학적 표기법 차단, 소수점 검증 개선

</details>

<details>
<summary>⚙️ <b>Backend</b></summary>

<br>

**API 엔드포인트 변경 시 수집 실패**
- 실행 시작 시점에만 UDDI를 조회 → 중간에 주소가 바뀌면 다음 수집 실패
- → 수집할 때마다 최신 엔드포인트 반영 + 실패 시 즉시 재갱신

**Google Calendar 작동 안 됨**
- CSP(콘텐츠 보안 정책)가 Google 로그인 스크립트를 차단
- → CSP 허용 목록에 Google 도메인 추가

**로그인 후 프로필 저장 안 됨**
- 페이지 새로고침마다 함수가 중복 호출 → 비정상 접근으로 차단
- → 세션 복원 시 UI만 복원, 실제 로그인 시에만 1회 호출

</details>

<details>
<summary>🤖 <b>AI</b></summary>

<br>

**Gemini API RPM 초과**
- Free Tier 제한으로 120개 데이터 한꺼번에 전송 시 분당 요청 제한 초과
- → **10개씩 배치 처리** + 에러 시 `time.sleep(20)` 후 자동 재시도

**지역 필터링 오류**
- `city` 없이 `district`만 올 때 필터가 통째로 스킵 → 타 지역 장학금 노출
- → `user_location_names` set으로 교체, `qualification` 텍스트에서 시/군 지명 추출 후 strict match

**5학년(초과학기) 선택 시 422 에러**
- `grade` 검증이 `le=4`로 막혀 있었고, 코드가 이미 이미지에 빌드됨
- → `le=8`로 수정 후 Docker 이미지 재빌드 + 컨테이너 재생성

</details>

<details>
<summary>🛠️ <b>Infra</b></summary>

<br>

**디스크 용량 부족**
- → Cinder 50GB 추가 부여 + Docker volume path 변경

**사용자 권한 문제**
- 서버에서 사용자별 권한을 나누다 보니 일부 막히는 곳이 존재
- → 그룹 권한으로 전환하여 권한 관리 일원화

</details>

---

## 💬 사용자 피드백

<table>
<tr>
<td width="33%">

> 💌 *"제 인생은 스칼라핏을 알게 된 것을 기점으로 크게 바뀌게 되었습니다. 저를 사람으로 만들어주셔서 감사합니다."*

</td>
<td width="33%">

> 🔥 *"이건 혁명이야!"*

</td>
<td width="33%">

> ⚡ *"빠른 시간 내에 찾을 수 있어서 수고로움이 줄어든 점이 좋다."*

</td>
</tr>
<tr>
<td>

> 🎯 *"내 조건을 더 상세하게 입력할 수 있다면 좋을 것 같다. 향후 올라오는 공고를 알림으로 받아볼 수 있으면 좋겠다."*

</td>
<td>

> 💡 *"핵심적인 조건(보훈 유공자 등)을 클릭 전 배너에 표시하면 더 유용할 수 있음"*

</td>
<td>

> ✨ *"한눈에 쏙 들어오는 UI 덕분에 복잡한 줄글 없이 핵심 정보를 바로 파악할 수 있었다."*

</td>
</tr>
</table>

---

## 📚 참고 자료

- [한국장학재단 공공데이터 API](https://www.data.go.kr/data/15028252/fileData.do)
- [교육부 — 국가장학금 통합신청 안내](https://www.moe.go.kr/)
- [드림스폰](https://www.dreamspon.com/)
- [조선대학교 장학안내](https://www3.chosun.ac.kr/sites/scho/index.do)
- 이필남 · 곽진숙 (2013). 「국가장학금이 대학생의 근로 및 학업활동에 미치는 영향」, *교육재정경제연구*, 22(4)
- 이지혜 · 김지연 (2023). 「민간 장학재단의 장학생 경험 분석」, *평생학습사회*, 19(4)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a7a56,100:3ECF8E&height=120&section=footer" />

**🎓 ScholarFit · 조선대학교 산학프로젝트1 · 2026**

<sub>장학 정보 탐색에서 실제 신청까지, 한 화면에서.</sub>

</div>
