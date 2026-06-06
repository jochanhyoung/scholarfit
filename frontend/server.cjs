const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const crypto = require('crypto');

const app = express();

// --- Google Calendar OAuth (server-side) ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALENDAR_REDIRECT_URI = process.env.CALENDAR_REDIRECT_URI
  || 'https://scholarfit.chosuncnl.cloud/api/auth/callback';
const SESSION_SECRET = process.env.SESSION_SECRET
  || crypto.randomBytes(32).toString('hex');

// In-memory stores with TTL
const _oauthStates = new Map(); // state -> { sessionId, exp }
const _calSessions = new Map(); // sessionId -> { token, exp }
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _oauthStates) if (v.exp < now) _oauthStates.delete(k);
  for (const [k, v] of _calSessions) if (v.exp < now) _calSessions.delete(k);
}, 10 * 60 * 1000);

function sign(val) {
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(val).digest('base64url');
  return `${val}.${mac}`;
}
function verify(signed) {
  const i = signed.lastIndexOf('.');
  if (i < 0) return null;
  const val = signed.slice(0, i), mac = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(val).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch { return null; }
  return val;
}
function parseCookies(h) {
  if (!h) return {};
  return Object.fromEntries(h.split(';').map(c => {
    const [k, ...v] = c.trim().split('=');
    return [k.trim(), v.join('=')];
  }));
}
function getCalSession(req) {
  const raw = parseCookies(req.headers.cookie)['_gcal'];
  const id = raw ? verify(raw) : null;
  if (!id) return null;
  const s = _calSessions.get(id);
  if (!s || s.exp < Date.now()) { _calSessions.delete(id); return null; }
  return s;
}

// --- Security headers + CSP ---
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "font-src 'self' data: https://cdn.jsdelivr.net",
      "img-src 'self' data: https:",
      "connect-src 'self' https://supabase.chosuncnl.cloud https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  next();
});

// --- Calendar OAuth endpoints (must be before the /api proxy) ---

// Step 1: Frontend calls this to get the OAuth URL
app.get('/api/calendar/start', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: '캘린더 기능이 서버에 설정되지 않았습니다.' });
  }
  const state = crypto.randomBytes(16).toString('hex');
  const sessionId = crypto.randomBytes(16).toString('hex');
  _oauthStates.set(state, { sessionId, exp: Date.now() + 10 * 60 * 1000 });

  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: CALENDAR_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'online',
    state,
  });
  res.json({ url });
});

// Step 2: Check if user already has a valid session (skip re-auth if so)
app.get('/api/calendar/status', (req, res) => {
  res.json({ authorized: !!getCalSession(req) });
});

// Step 3: Google redirects here after user consent
app.get('/api/auth/callback', async (req, res) => {
  const origin = CALENDAR_REDIRECT_URI.replace(/\/api\/auth\/callback$/, '');
  const html = (ok, msg) => `<!DOCTYPE html><html><body><script>
    (window.opener || window.parent).postMessage(
      ${JSON.stringify({ type: 'gcal-oauth', ok, msg })},
      ${JSON.stringify(origin)}
    );
    window.close();
  </script></body></html>`;

  const { code, state, error } = req.query;
  if (error || !code || !state) return res.send(html(false, error || 'cancelled'));

  const sd = _oauthStates.get(state);
  if (!sd || sd.exp < Date.now()) {
    _oauthStates.delete(state);
    return res.send(html(false, 'invalid_state'));
  }
  _oauthStates.delete(state);

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: CALENDAR_REDIRECT_URI, grant_type: 'authorization_code',
      }),
    });
    const td = await tokenRes.json();
    if (!td.access_token) {
      console.error('[Calendar OAuth] token exchange failed:', td);
      return res.send(html(false, 'token_exchange_failed'));
    }

    _calSessions.set(sd.sessionId, {
      token: td.access_token,
      exp: Date.now() + (td.expires_in || 3600) * 1000,
    });
    res.setHeader('Set-Cookie',
      `_gcal=${sign(sd.sessionId)}; Path=/api/calendar; HttpOnly; SameSite=Lax; Max-Age=3600`
    );
    res.send(html(true, 'authorized'));
  } catch (e) {
    console.error('[Calendar OAuth] callback error:', e);
    res.send(html(false, 'server_error'));
  }
});

// Step 4: Frontend sends pre-built event objects; backend posts to Google Calendar
app.post('/api/calendar/add-events', express.json({ limit: '512kb' }), async (req, res) => {
  const session = getCalSession(req);
  if (!session) return res.status(401).json({ error: '인증이 필요합니다. 다시 시도해 주세요.' });

  const { events } = req.body;
  if (!Array.isArray(events) || events.length === 0 || events.length > 50) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  const results = await Promise.allSettled(
    events.map(ev =>
      fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ev),
      }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
    )
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) console.error('[Calendar] event failures:', failed.length);

  res.json({
    ok: true,
    created: results.filter(r => r.status === 'fulfilled').length,
    failed: failed.length,
  });
});

// --- Account deletion ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

app.delete('/api/auth/delete-account', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }
  const accessToken = auth.slice(7);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: '서버 설정 오류입니다.' });
  }

  try {
    // 1. 토큰 검증 및 사용자 ID 조회
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });
    if (!userRes.ok) return res.status(401).json({ error: '유효하지 않은 인증입니다.' });
    const { id: userId } = await userRes.json();

    // 2. users 테이블 데이터 삭제
    await fetch(`${SUPABASE_URL}/rest/v1/users?auth_user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    // 3. Supabase Auth 계정 삭제
    const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });
    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({}));
      console.error('[DeleteAccount]', err);
      return res.status(500).json({ error: '계정 삭제에 실패했습니다.' });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('[DeleteAccount] error:', e);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// --- AI search proxy ---
app.use('/api', createProxyMiddleware({
  target: 'http://ai-search:8001',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  on: {
    proxyReq: (proxyReq) => {
      if (process.env.PROXY_SECRET) {
        proxyReq.setHeader('X-Proxy-Secret', process.env.PROXY_SECRET);
      }
    },
  },
}));

app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 5173;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend + proxy running on port ${PORT}`);
});
