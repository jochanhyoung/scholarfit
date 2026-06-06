-- RLS 활성화 및 정책 적용 (init.sql에 정의됐으나 실제 DB에 미적용된 항목 수정)
-- 실행: docker exec supabase-db psql -U postgres -d postgres -f /path/to/fix_rls.sql

-- ── users ──────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_self_only" ON users;
CREATE POLICY "users_self_only" ON users
  FOR ALL
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- ── user_languages ─────────────────────────────────────────
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_languages_self_only" ON user_languages;
CREATE POLICY "user_languages_self_only" ON user_languages
  FOR ALL
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_languages.user_id))
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_languages.user_id));

-- ── user_oauth ─────────────────────────────────────────────
ALTER TABLE user_oauth ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_oauth_self_only" ON user_oauth;
CREATE POLICY "user_oauth_self_only" ON user_oauth
  FOR ALL
  USING (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_oauth.user_id))
  WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE user_id = user_oauth.user_id));

-- ── sync_history ───────────────────────────────────────────
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sync_history_deny_anon" ON sync_history;
CREATE POLICY "sync_history_deny_anon" ON sync_history
  FOR ALL
  USING (false);

-- ── regions (공개 읽기 전용) ────────────────────────────────
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "regions_public_read" ON regions;
CREATE POLICY "regions_public_read" ON regions
  FOR SELECT
  USING (true);

-- ── scholarship_conditions (공개 읽기 전용) ─────────────────
ALTER TABLE scholarship_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scholarship_conditions_public_read" ON scholarship_conditions;
CREATE POLICY "scholarship_conditions_public_read" ON scholarship_conditions
  FOR SELECT
  USING (true);

-- ── scholarship_language_conditions (공개 읽기 전용) ─────────
ALTER TABLE scholarship_language_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scholarship_language_conditions_public_read" ON scholarship_language_conditions;
CREATE POLICY "scholarship_language_conditions_public_read" ON scholarship_language_conditions
  FOR SELECT
  USING (true);
