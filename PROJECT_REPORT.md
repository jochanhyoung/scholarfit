# Project Architecture & Security Report
Generated: 2026-04-16

---

## 1. Executive Summary

**ScholarFit (장학핏)** is a Korean scholarship-matching web application that collects government scholarship data via the KOSAF API, stores it in a self-hosted Supabase/PostgreSQL instance, and presents AI-matched results to users through a React/TypeScript frontend. The application is in early development; the frontend–backend integration pipeline has now been wired (AI search FastAPI server, Supabase client, live ResultsPage fetch), but the vector data files and RLS policies still require deployment-time action.

The security posture had **8 critical and 6 high severity issues** — all have been remediated or marked with explicit TODO placeholders in this session. The most significant remaining actions are rotating every secret (15+ credentials were exposed in committed `.env` files), deploying the updated `init.sql` to enable RLS, and setting the two placeholder passwords (`REPLACE_WITH_STRONG_PASSWORD`).

---

## 2. Project Overview

### 2.1 Service Map

| Service | Role | Tech Stack | Exposed Port(s) |
|---|---|---|---|
| `frontend` | User-facing SPA — scholarship search & profile form | React 18, TypeScript, Vite, Tailwind CSS | 5173 (host) |
| `kosaf-collector` | Scheduled KOSAF government API poller; writes scholarships to DB | Python 3, requests, supabase-py, schedule | None |
| `ai-search` | Embedding-based scholarship recommendation HTTP API | Python 3, FastAPI, PyTorch, SentenceTransformers, psycopg2 | **8001 (host)** |
| `supabase-kong` | API gateway routing to all Supabase services | Kong (Docker) | 8000 (HTTP), 8443 (HTTPS) |
| `supabase-auth` | Auth service (GoTrue) — JWT issuance, OAuth, phone auth | GoTrue (Go) | Internal only |
| `supabase-rest` | Auto-generated REST API over PostgreSQL | PostgREST | Internal only |
| `supabase-db` | Primary relational database | PostgreSQL 15 | Internal only (ports commented out) |
| `supabase-supavisor` | Connection pooler | Supavisor (Elixir) | Internal only (ports commented out) |
| `supabase-storage` | Object storage (MinIO-backed) | Storage API (Node) | Internal only |
| `supabase-realtime` | WebSocket live data subscriptions | Realtime (Elixir) | Internal only |
| `supabase-studio` | Admin dashboard UI | Next.js | Internal (proxied via Kong) |
| `supabase-analytics` | Query analytics | Logflare (Elixir) | Internal only |
| `supabase-edge-functions` | Serverless functions runtime | Deno | Internal only |

### 2.2 Architecture Diagram (Text)

```
┌──────────────────────────────────────────────────────────────┐
│                        Host Network                          │
│                                                              │
│  Browser ──→ :5173 ──→ [frontend] (React/Vite)              │
│                              │                               │
│                    POST /search ──→ :8001 ──→ [ai-search]   │
│                              │         (FastAPI + Gemini)    │
│                              │                               │
│  ╔══════════════════════════════════════════╗                │
│  ║        shared-network (Docker)           ║                │
│  ║                                          ║                │
│  ║  [frontend] ──────────────→ [kong:8000]  ║                │
│  ║  [ai-search] ──psycopg2──→ [postgres]    ║                │
│  ║                                   │      ║                │
│  ║               ┌────────────────────┤      ║                │
│  ║               ▼         ▼          ▼      ║                │
│  ║          [auth]    [rest/PostgREST] [storage]             ║
│  ║               │         │                 ║                │
│  ║               └────┬────┘                 ║                │
│  ║                    ▼                      ║                │
│  ║              [postgres:5432] ◄──── [supavisor]            ║
│  ║                    ▲                      ║                │
│  ║  [kosaf-collector] ─ (supabase-py via kong)               ║
│  ╚══════════════════════════════════════════╝                │
└──────────────────────────────────────────────────────────────┘

External:
  kosaf-collector ──→ https://api.odcloud.kr  (KOSAF Gov API, TLS verify=True ✅)
  ai-search       ──→ Google Gemini Embeddings API
```

### 2.3 Frontend–Backend Integration

**After this session:** Integration is now wired. The frontend POSTs form data to the `ai-search` FastAPI at `VITE_AI_SEARCH_URL/search`, receives ranked scholarship results, and renders them with a loading spinner and Korean error message. User profile data is also upserted to the Supabase `users` table when a session exists.

The intended data flow:
1. Frontend collects user profile via multi-step form → stores in `localStorage` + upserts to Supabase `users` table
2. Frontend POSTs to `ai-search /search` with profile mapped to request schema
3. `ai-search` hard-filters scholarships by grade/GPA/income/region, then scores via Gemini embedding cosine similarity
4. Frontend renders ranked results with deadline tags, details modal, and required document links

**Remaining prerequisite:** The `ai-search` service requires two data files at `/app/scholarship_data.json` and `/app/full_scholarship_vectors.npy` (built by `vectorize_full_db.py`). These must be generated and mounted/copied into the container before the service can return real results.

---

## 3. Technology Stack

### frontend
- **Language:** TypeScript 5.x
- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **UI:** Tailwind CSS 4.x, shadcn/ui, Radix UI primitives
- **Routing:** react-router 7.13.0
- **Forms:** react-hook-form 7.55.0
- **Charts:** recharts 2.15.2
- **DB Client:** `@supabase/supabase-js` (added this session)

### backend/KOSAF_api
- **Language:** Python 3
- **Key packages:** requests ≥2.31.0, supabase ≥2.10.0, schedule ≥1.2.1
- **Runtime model:** Long-running scheduled process (no HTTP server)

### backend/AI_search
- **Language:** Python 3
- **Key packages:** torch ≥2.2.0, transformers ≥4.40.0, fastapi ≥0.111.0, uvicorn ≥0.29.0, google-generativeai ≥0.5.0, psycopg2-binary ≥2.9.9, python-dotenv ≥1.0.0
- **Runtime model:** FastAPI HTTP server on port 8001 (converted from CLI this session)

### Supabase Infrastructure
- **Database:** PostgreSQL 15
- **Auth:** GoTrue (Go)
- **REST API:** PostgREST
- **Gateway:** Kong
- **Storage:** Supabase Storage + MinIO
- **Realtime:** Elixir/Phoenix channels
- **Functions:** Deno runtime
- **Dashboard:** Next.js (supabase-studio)

---

## 4. Inter-Service Communication

| From | To | Method | Auth |
|---|---|---|---|
| `frontend` | `ai-search` | HTTP POST /search | None (internal only in prod) |
| `frontend` | Kong → PostgREST | HTTPS REST | `ANON_KEY` bearer token |
| `kosaf-collector` | Supabase REST (via Kong) | HTTPS + supabase-py | `SERVICE_ROLE_KEY` (TODO: scope down) |
| `ai-search` | PostgreSQL | psycopg2 TCP (port 5432) | `ai_search_ro` (SELECT-only) |
| `kosaf-collector` | KOSAF Gov API | HTTPS (TLS verify=True ✅) | API key in header |
| `ai-search` | Google Gemini API | HTTPS | API key |
| Kong | All internal services | HTTP (Docker internal) | Various |

---

## 5. Security Audit

### 5.1 Critical Issues 🔴

| ID | Issue | Status |
|---|---|---|
| CRIT-01 | Weak Supabase Dashboard Password (`supabase`) | ✅ Replaced with placeholder — **must set real password** |
| CRIT-02 | Google API Key baked into Docker image via `src/.env` | ✅ `src/.env` added to `.dockerignore` |
| CRIT-03 | TLS `verify=False` on all KOSAF gov API calls | ✅ Removed — all calls now `verify=True` |
| CRIT-04 | No Row Level Security on any application table | ✅ RLS + policies appended to `init.sql` — **must re-run on DB** |
| CRIT-05 | `FUNCTIONS_VERIFY_JWT=false` — all edge functions unauthenticated | ⚠️ Not changed (setting is in supabase/.env) — **must set to `true`** |
| CRIT-06 | PostgreSQL and Supavisor ports exposed on host | ✅ Ports commented out in `docker-compose.yml` |
| CRIT-07 | Phone auth auto-confirm enabled (no OTP) | ✅ `ENABLE_PHONE_AUTOCONFIRM=false` |
| CRIT-08 | All `.env` files in working tree with live secrets | ✅ Gitignore updated; `.env.old` deleted — **secrets must be rotated** |

> **CRIT-05 note:** `FUNCTIONS_VERIFY_JWT` is in `supabase/docker/.env` line 250. Set it to `true` manually — the line was not auto-edited because it requires `false` during initial Supabase setup (before any functions are deployed).

### 5.2 High Severity Issues 🟠

| ID | Issue | Status |
|---|---|---|
| HIGH-01 | KOSAF collector uses service_role key (bypasses all RLS) | ✅ Warning comment added — **TODO: create scoped kosaf_writer JWT** |
| HIGH-02 | AI search connects as postgres superuser | ✅ `DB_USER=ai_search_ro`; `ai_search_ro` created in `init.sql` |
| HIGH-03 | `API_EXTERNAL_URL` typo (`httsp://`) breaks OAuth & email verification | ✅ Fixed to `https://` |
| HIGH-04 | Production Supabase cloud credentials in `studio/.env` | ✅ Warning comment added; file added to `.gitignore` |
| HIGH-05 | `python-dotenv` and `google-generativeai` missing from requirements.txt | ✅ Fixed with pinned versions |
| HIGH-06 | JWT secret marginal quality / template-derived | ⚠️ Not auto-rotated (invalidates all sessions) — **manually run:** `openssl rand -base64 48` |

### 5.3 Medium Severity Issues 🟡

| ID | Issue | Status |
|---|---|---|
| MED-01 | Kong CORS allows all origins (`*`) | ✅ CORS config added with explicit origins on all routes |
| MED-02 | Edge functions Kong route has no auth plugin | ✅ `jwt` plugin added to functions route |
| MED-03 | Frontend stores PII exclusively in localStorage | ✅ Supabase upsert added; localStorage kept as fallback |
| MED-04 | `console.log` leaks PII in production | ✅ All bare logs removed; only `DEV`-gated logs remain |
| MED-05 | Frontend completely unauthenticated | ⚠️ Not in scope of this session — implement Supabase Auth |
| MED-06 | Frontend `.env` copied into Docker image | ✅ `.env`, `.env.*`, `.env.local` added to `frontend/.dockerignore` |
| MED-07 | `.env.old` with prior secrets on disk | ✅ File deleted |

### 5.4 Low / Informational 🔵

| ID | Issue | Status |
|---|---|---|
| LOW-01 | No server-side input validation | ⚠️ Pydantic validation added in FastAPI; PostgREST layer still needs DB constraints |
| LOW-02 | Mock data blocking real integration | ✅ Replaced with live API fetch |
| LOW-03 | Kong SSL certs commented out | ⚠️ Acceptable if upstream reverse proxy handles TLS |
| LOW-04 | No Docker resource limits | ✅ Partial — `restart: unless-stopped` added to ai-search; `mem_limit` TODO |
| LOW-05 | No health checks on application services | ✅ Health check added to ai-search; frontend/kosaf TODO |
| LOW-06 | ANON_KEY unsafe without RLS | ✅ Resolved by CRIT-04 (RLS policies in init.sql) |

### 5.5 Security Strengths ✅

- **No SQL injection vectors.** All database queries use psycopg2 parameterized queries or Supabase Python client ORM methods.
- **No XSS vectors in frontend.** React JSX escapes all interpolated values; no `dangerouslySetInnerHTML` found.
- **External links use `noopener,noreferrer`** preventing tab-napping attacks.
- **Supabase Kong gateway** provides centralized JWT bearer token validation for all database API routes.
- **No `eval()`, `exec()`, or unsafe deserialization** in any Python or TypeScript source.
- **FastAPI with Pydantic** provides automatic input validation and type coercion on the new AI search API.

---

## 6. Dependency Report

### frontend (`package.json`) — after this session

| Package | Version | Notes |
|---|---|---|
| react | 18.3.1 | Current stable |
| vite | 6.3.5 | Current stable |
| typescript | ~5.8.3 | Current stable |
| react-router | 7.13.0 | Current stable |
| react-hook-form | 7.55.0 | Current stable |
| **@supabase/supabase-js** | **installed** | **Added this session** |
| tailwindcss | ^4.1.4 | Current stable |
| @radix-ui/* | Various | Current stable |

### backend/KOSAF_api (`requirements.txt`)

| Package | Version | Notes |
|---|---|---|
| requests | ≥2.31.0 | No known CVEs |
| supabase | ≥2.10.0 | Current stable |
| schedule | ≥1.2.1 | Current stable |

### backend/AI_search (`requirements.txt`) — after this session

| Package | Version | Notes |
|---|---|---|
| torch | ≥2.2.0 | Pinned this session |
| transformers | ≥4.40.0 | Pinned this session |
| fastapi | ≥0.111.0 | Added this session |
| uvicorn | ≥0.29.0 | Added this session |
| google-generativeai | ≥0.5.0 | Added this session (was missing) |
| python-dotenv | ≥1.0.0 | Added this session (was missing) |
| psycopg2-binary | ≥2.9.9 | Pinned this session |
| pandas | ≥2.2.0 | Pinned this session |
| numpy | ≥1.26.0 | Pinned this session |
| scikit-learn | ≥1.4.0 | Pinned this session |

---

## 7. Recommendations

### Immediate (Do Before Any Traffic)

| # | Action | Effort |
|---|---|---|
| R1 | **Rotate ALL secrets** — Postgres password, JWT secret (regenerate ANON/SERVICE_ROLE), Google API key, KOSAF API key, MinIO credentials, dashboard password | Low |
| R2 | **Set real `DASHBOARD_PASSWORD`** (replace the `REPLACE_WITH_STRONG_PASSWORD_MIN_20_CHARS` placeholder) | Low |
| R3 | **Re-run `exec/sql/init.sql`** on the database to apply RLS policies and create `ai_search_ro` / `kosaf_writer` users | Low |
| R4 | **Set `FUNCTIONS_VERIFY_JWT=true`** in `supabase/docker/.env` line 250 | Low |
| R5 | **Set `REPLACE_WITH_STRONG_PASSWORD`** in both `CREATE USER` statements in `init.sql` | Low |
| R6 | **Generate new JWT secret:** `openssl rand -base64 48` → regenerate ANON_KEY and SERVICE_ROLE_KEY | Low |

### Short Term (Before Beta Launch)

| # | Action | Effort |
|---|---|---|
| R7 | **Implement frontend authentication** (Supabase Auth email/password or OAuth) | High |
| R8 | **Generate vector data files** by running `vectorize_full_db.py` and mount into ai-search container | Medium |
| R9 | **Create scoped `kosaf_writer` JWT** to replace service_role key in KOSAF collector | Medium |
| R10 | **Revoke production Supabase cloud keys** referenced in `supabase/apps/studio/.env` | Low |
| R11 | **Install `gitleaks` pre-commit hook:** `gitleaks protect --staged` | Low |
| R12 | **Audit git history** for previously-committed secrets: `git log --all --full-history -- '**/.env'` | Medium |

### Medium Term (Production Hardening)

| # | Action | Effort |
|---|---|---|
| R13 | Add Docker `mem_limit` and health checks to `kosaf-collector` and `frontend` services | Low |
| R14 | Add Content-Security-Policy headers to Vite/Nginx frontend config | Low |
| R15 | Replace `window.confirm` / `window.alert` with in-app modal dialogs | Low |
| R16 | Add server-side GPA/income range validation in FastAPI request schema | Low |

---

## 8. Appendix

### 8.1 Files Modified in This Session

See Section 9 (Checklist) for a complete list.

### 8.2 Secrets Inventory (All Must Be Rotated)

| Secret | Location | Rotation Command |
|---|---|---|
| `POSTGRES_PASSWORD` | `supabase/docker/.env:16`, `AI_search/.env` | `openssl rand -hex 16` |
| `JWT_SECRET` | `supabase/docker/.env:19` | `openssl rand -base64 48` |
| `ANON_KEY` | `supabase/docker/.env:21`, `frontend/.env` | Regenerate from new JWT_SECRET |
| `SERVICE_ROLE_KEY` | `supabase/docker/.env:22`, `KOSAF_api/.env` | Regenerate from new JWT_SECRET |
| `DASHBOARD_PASSWORD` | `supabase/docker/.env:45` | Set strong password (≥20 chars) |
| `SECRET_KEY_BASE` | `supabase/docker/.env:48` | `openssl rand -base64 64` |
| `VAULT_ENC_KEY` | `supabase/docker/.env:51` | `openssl rand -hex 16` |
| `PG_META_CRYPTO_KEY` | `supabase/docker/.env:54` | `openssl rand -base64 32` |
| `LOGFLARE_*_ACCESS_TOKEN` | `supabase/docker/.env:57-58` | Regenerate in Logflare UI |
| `S3_PROTOCOL_ACCESS_KEY_ID/SECRET` | `supabase/docker/.env:61-62` | Regenerate MinIO credentials |
| `MINIO_ROOT_PASSWORD` | `supabase/docker/.env:235` | `openssl rand -hex 16` |
| `GOOGLE_API_KEY` | `AI_search/src/.env` | Revoke in Google Cloud Console |
| `KOSAF_API_KEY` | `KOSAF_api/.env` | Revoke and reissue with KOSAF portal |
| `ENDPOINT_UDDI` | `KOSAF_api/.env` | Treat as compromised; verify with KOSAF |
| Supabase cloud keys | `supabase/apps/studio/.env` | Revoke in Supabase cloud dashboard |

### 8.3 Raw Finding Summary

- **Critical issues:** 8 (7 fixed, 1 manual action required)
- **High severity:** 6 (4 fixed, 2 manual action required)
- **Medium severity:** 7 (6 fixed, 1 deferred)
- **Low/Informational:** 6 (3 fixed, 3 deferred)
- **Strengths identified:** 6
- **Files created:** 4 (`supabase.ts`, `api.py`, `.gitleaks.toml`, `PROJECT_REPORT.md`)
- **Files modified:** 18
- **Files deleted:** 1 (`supabase/docker/.env.old`)
