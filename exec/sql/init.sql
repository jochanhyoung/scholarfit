CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. 기존 꼬인 테이블 싹 다 지우기
DROP TABLE IF EXISTS sync_history CASCADE;
DROP TABLE IF EXISTS scholarship_language_conditions CASCADE;
DROP TABLE IF EXISTS scholarship_conditions CASCADE;
DROP TABLE IF EXISTS scholarships CASCADE;
DROP TABLE IF EXISTS user_oauth CASCADE;
DROP TABLE IF EXISTS user_languages CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- 2. 지역 마스터
CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    sido TEXT NOT NULL,
    sigungu TEXT NOT NULL
);

-- 3. 사용자
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    profile_image TEXT,
    provider TEXT,
    is_freshman BOOLEAN DEFAULT FALSE,
    grade INT CHECK (grade BETWEEN 1 AND 5),
    gpa_scale FLOAT8,
    last_gpa FLOAT8,
    total_gpa FLOAT8,
    income_decile INT CHECK (income_decile BETWEEN 0 AND 10),
    gender TEXT,
    region_id INT REFERENCES regions(region_id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 어학 성적
CREATE TABLE user_languages (
    language_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    lang_type TEXT NOT NULL,
    score TEXT
);

-- 5. 구글 연동
CREATE TABLE user_oauth (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'google',
    provider_user_id TEXT,
    email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    is_sync_enabled BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_oauth_provider_user_unique UNIQUE (provider, provider_user_id)
);

-- 6. 장학금
CREATE TABLE scholarships (
    scholarship_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT,
    institution_type TEXT,
    product_type TEXT,
    aid_type TEXT,
    university_type TEXT,
    grade_type TEXT,
    major_type TEXT,
    min_grade INT,
    max_grade INT,
    min_gpa FLOAT8,
    gpa_scale FLOAT8,
    max_income_decile INT CHECK (
        max_income_decile IS NULL
        OR (max_income_decile BETWEEN 0 AND 10)
    ),
    required_gender TEXT,
    required_region_id INT REFERENCES regions(region_id),
    start_date DATE,
    deadline DATE,
    amount TEXT,
    selection_count TEXT,
    required_documents TEXT,
    source_url TEXT,
    detail_url TEXT,
    region_id INT REFERENCES regions(region_id),
    -- 선발/자격 상세
    selection_criteria TEXT,
    qualification TEXT,
    application_method TEXT,
    contact_info TEXT,
    -- 원문 텍스트 (필터링용)
    raw_gpa_text TEXT,
    raw_income_text TEXT,
    raw_grade_text TEXT,
    raw_major_text TEXT,
    raw_region_text TEXT,
    -- 상태 관리
    status TEXT DEFAULT 'unknown',
    is_open BOOLEAN DEFAULT FALSE,
    closed_reason TEXT,
    -- 원본 JSON
    raw_json JSONB,
    -- upsert 기준
    CONSTRAINT scholarships_title_provider_unique UNIQUE (title, provider)
);

-- 7. 장학금 상세 조건 (🚨 여기도 UNIQUE 조건 제거)
CREATE TABLE scholarship_conditions (
    condition_id SERIAL PRIMARY KEY,
    scholarship_id INT NOT NULL REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
    cond_type TEXT NOT NULL,
    cond_value TEXT NOT NULL
);

-- 8. 장학금 어학 조건
CREATE TABLE scholarship_language_conditions (
    language_condition_id SERIAL PRIMARY KEY,
    scholarship_id INT NOT NULL REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
    lang_type TEXT NOT NULL,
    min_score TEXT NOT NULL
);

-- 9. 캘린더 동기화
CREATE TABLE sync_history (
    sync_history_id SERIAL PRIMARY KEY,
    scholarship_id INT NOT NULL REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    google_event_id TEXT
);

-- 10. Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_oauth ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_only" ON users FOR ALL USING (auth.uid() = auth_user_id);
CREATE POLICY "scholarships_public_read" ON scholarships FOR SELECT USING (true);
CREATE POLICY "user_languages_self_only" ON user_languages FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_languages.user_id));
CREATE POLICY "user_oauth_self_only" ON user_oauth FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_oauth.user_id));
CREATE POLICY "sync_history_deny_anon" ON sync_history FOR ALL USING (false);

-- 11. Least-privilege DB users
CREATE USER ai_search_ro WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
GRANT CONNECT ON DATABASE postgres TO ai_search_ro;
GRANT USAGE ON SCHEMA public TO ai_search_ro;
GRANT SELECT ON scholarships TO ai_search_ro;

CREATE USER kosaf_writer WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
GRANT CONNECT ON DATABASE postgres TO kosaf_writer;
GRANT USAGE ON SCHEMA public TO kosaf_writer;
GRANT INSERT, UPDATE ON scholarships TO kosaf_writer;
GRANT INSERT ON sync_history TO kosaf_writer;