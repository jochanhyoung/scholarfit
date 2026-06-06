-- ============================================================
-- 마이그레이션: main.py가 저장하는 누락 컬럼 추가
-- 실행 전: psql -h <host> -U postgres -d postgres -f migrate_missing_columns.sql
-- ============================================================

-- 1. scholarships 테이블 누락 컬럼 추가
ALTER TABLE scholarships
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS closed_reason TEXT,
    ADD COLUMN IF NOT EXISTS contact_info TEXT,
    ADD COLUMN IF NOT EXISTS raw_gpa_text TEXT,
    ADD COLUMN IF NOT EXISTS raw_income_text TEXT,
    ADD COLUMN IF NOT EXISTS raw_grade_text TEXT,
    ADD COLUMN IF NOT EXISTS raw_major_text TEXT,
    ADD COLUMN IF NOT EXISTS raw_region_text TEXT,
    ADD COLUMN IF NOT EXISTS detail_url TEXT,
    ADD COLUMN IF NOT EXISTS raw_json JSONB;

-- 2. UNIQUE 제약 추가 (upsert에 필수)
--    pg_indexes로 체크 — 인덱스·제약 어느 형태로 존재해도 스킵
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename  = 'scholarships'
          AND indexname  = 'scholarships_title_provider_unique'
    ) THEN
        -- 중복 제거: title+provider 기준 가장 최신 row만 유지
        DELETE FROM scholarships s1
        USING scholarships s2
        WHERE s1.title    = s2.title
          AND s1.provider = s2.provider
          AND s1.scholarship_id < s2.scholarship_id;

        ALTER TABLE scholarships
            ADD CONSTRAINT scholarships_title_provider_unique UNIQUE (title, provider);
    END IF;
END $$;

-- 3. users 테이블: 소셜 로그인용 컬럼 추가
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS profile_image TEXT,
    ADD COLUMN IF NOT EXISTS provider TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- email unique 제약
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename  = 'users'
          AND indexname  = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- 4. user_oauth 테이블: provider/token 컬럼 추가
ALTER TABLE user_oauth
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'google',
    ADD COLUMN IF NOT EXISTS provider_user_id TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS access_token TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- provider+provider_user_id unique 제약 (upsert에 필수)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename  = 'user_oauth'
          AND indexname  = 'user_oauth_provider_user_unique'
    ) THEN
        ALTER TABLE user_oauth
            ADD CONSTRAINT user_oauth_provider_user_unique
            UNIQUE (provider, provider_user_id);
    END IF;
END $$;

-- 5. 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'scholarships'
  AND table_schema = 'public'
ORDER BY ordinal_position;
