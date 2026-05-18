const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const SESSION_KEY     = 'questly.session';
const LOCAL_ACCTS_KEY = 'questly.local_accounts';
const LOCAL_TOKENS_KEY = 'questly.local_tokens';

export const emptyStats = {
  points: 0,
  streak: 1,
  bestStreak: 0,
  currentRunStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  masteredSkills: 0,
  subjectsTried: 0,
  earnedBadges: [],
};

// ── session storage (tab-scoped) ──────────────────────────────────────────────

const readSession = () => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeSession = ({ username, userId, token }) => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, userId, token }));
  } catch { }
};

// ── local account store (used when server is unreachable) ─────────────────────

const readLocalAccounts = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_ACCTS_KEY) || '{}'); }
  catch { return {}; }
};

const writeLocalAccounts = (accounts) => {
  try { localStorage.setItem(LOCAL_ACCTS_KEY, JSON.stringify(accounts)); }
  catch { }
};

const readLocalTokens = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_TOKENS_KEY) || '{}'); }
  catch { return {}; }
};

const writeLocalTokens = (tokens) => {
  try { localStorage.setItem(LOCAL_TOKENS_KEY, JSON.stringify(tokens)); }
  catch { }
};

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(password + salt);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const isNetworkError = (err) =>
  err instanceof TypeError ||
  err.message === 'Failed to fetch' ||
  err.message.includes('NetworkError') ||
  err.message.includes('network');

// ── server request helper ─────────────────────────────────────────────────────

const request = async (path, options = {}) => {
  const session = readSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || 'Request failed');
  return payload;
};

const normalizeUsername = (u) => String(u || '').trim().toLowerCase();

// ── public API ────────────────────────────────────────────────────────────────

export const createAccount = async ({ username, password, name, role }) => {
  const norm = normalizeUsername(username);
  if (!norm) throw new Error('Choose a username.');
  if (String(password || '').length < 6) throw new Error('Password must be at least 6 characters.');

  try {
    const payload = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: norm, password, name, role }),
    });
    writeSession({ username: payload.user.username, userId: payload.user.id, token: payload.token });
    return { ...payload, source: 'database' };
  } catch (err) {
    if (!isNetworkError(err)) throw err;

    // ── offline fallback ──
    const accounts = readLocalAccounts();
    if (accounts[norm]) throw new Error('That username is already taken. Try another.');
    const salt   = genId();
    const hash   = await hashPassword(password, salt);
    const userId = 'local_' + genId();
    const token  = 'local_' + genId();

    accounts[norm] = { userId, username: norm, name: name || norm, role: role || 'student', hash, salt };
    writeLocalAccounts(accounts);

    const tokens = readLocalTokens();
    tokens[token] = norm;
    writeLocalTokens(tokens);

    writeSession({ username: norm, userId, token });
    return {
      user: { id: userId, username: norm, name: name || norm, role: role || 'student' },
      token,
      source: 'local',
    };
  }
};

export const signInAccount = async ({ username, password }) => {
  const norm = normalizeUsername(username);
  if (!norm) throw new Error('Enter your username.');
  if (!password) throw new Error('Enter your password.');

  try {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: norm, password }),
    });
    writeSession({ username: payload.user.username, userId: payload.user.id, token: payload.token });
    return { ...payload, source: 'database' };
  } catch (err) {
    if (!isNetworkError(err)) throw err;

    // ── offline fallback ──
    const accounts = readLocalAccounts();
    const acct = accounts[norm];
    if (!acct) throw new Error('No account found for that username.');
    const hash = await hashPassword(password, acct.salt);
    if (hash !== acct.hash) throw new Error('Incorrect password.');

    const token = 'local_' + genId();
    const tokens = readLocalTokens();
    tokens[token] = norm;
    writeLocalTokens(tokens);

    writeSession({ username: norm, userId: acct.userId, token });
    return {
      user: { id: acct.userId, username: norm, name: acct.name, role: acct.role },
      token,
      source: 'local',
    };
  }
};

export const loadSavedSession = async () => {
  const session = readSession();
  if (!session?.token) return null;

  // Local token — resolve from localStorage directly
  if (session.token.startsWith('local_')) {
    const tokens = readLocalTokens();
    const norm = tokens[session.token];
    if (!norm) { clearSavedSession(); return null; }
    const accounts = readLocalAccounts();
    const acct = accounts[norm];
    if (!acct) { clearSavedSession(); return null; }
    return {
      user: { id: acct.userId, username: norm, name: acct.name, role: acct.role },
      token: session.token,
      source: 'local',
    };
  }

  // Server token — verify with backend
  try {
    const payload = await request('/auth/me');
    return { ...payload, source: 'database' };
  } catch {
    clearSavedSession();
    return null;
  }
};

export const saveLearningState = async (user, progress, stats) => {
  if (!user?.username) return;
  if (user.source === 'local') return; // no server to sync to

  try {
    await request('/learning-state', {
      method: 'PUT',
      body: JSON.stringify({ progress, stats }),
    });
  } catch {
    // offline — progress held in React state until next sync
  }
};

export const clearSavedSession = () => {
  try { window.sessionStorage.removeItem(SESSION_KEY); } catch { }
  // legacy cleanup
  try { window.localStorage.removeItem('wijs.session'); } catch { }
  try { window.localStorage.removeItem('wijs.accounts'); } catch { }
};
