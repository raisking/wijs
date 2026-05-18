require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || 4000);
// C-4/H-5: Always require a strong secret — no fallback, no environment gate.
// A missing or weak secret makes every JWT token forgeable.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET env var must be set and at least 32 characters. Run: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\')"');
}
const JWT_EXPIRES_IN = '24h';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---------- helpers ----------

const send = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
    if (data.length > 1_000_000) { reject(new Error('Request body too large.')); req.destroy(); }
  });
  req.on('end', () => {
    try { resolve(data ? JSON.parse(data) : {}); }
    catch { reject(new Error('Invalid JSON body.')); }
  });
});

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, original] = String(stored || '').split(':');
  if (!salt || !original) return false;
  const candidate = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(original, 'hex'));
};

// C-5: Lock algorithm to HS256 — prevents "alg:none" bypass and algorithm confusion attacks.
const signToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN });

const verifyToken = (req) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw Object.assign(new Error('Missing auth token.'), { status: 401 });
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw Object.assign(new Error('Invalid or expired token.'), { status: 401 });
  }
};

const publicUser = (row) => ({
  id: row.id,
  username: row.email,
  name: row.display_name,
  role: row.role,
});

// ---------- DB helpers ----------

const ensureTables = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email           text UNIQUE NOT NULL,
      password_hash   text NOT NULL,
      display_name    text NOT NULL DEFAULT '',
      role            text NOT NULL DEFAULT 'student',
      is_active       boolean NOT NULL DEFAULT true,
      created_at      timestamptz NOT NULL DEFAULT now(),
      last_login_at   timestamptz
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      first_name text NOT NULL DEFAULT ''
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS parent_profiles (
      user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      billing_email text NOT NULL DEFAULT ''
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_learning_state (
      user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      progress_data jsonb NOT NULL DEFAULT '{}'::jsonb,
      stats_data    jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at    timestamptz NOT NULL DEFAULT now()
    )
  `);
};

const getLearningState = async (client, userId) => {
  const r = await client.query(
    'SELECT progress_data, stats_data FROM user_learning_state WHERE user_id = $1',
    [userId]
  );
  return { progress: r.rows[0]?.progress_data || {}, stats: r.rows[0]?.stats_data || {} };
};

// ---------- server ----------

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  try {
    if (!process.env.DATABASE_URL) {
      return send(res, 503, { error: 'DATABASE_URL is not configured.' });
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : {};

    // POST /api/auth/register
    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || username).trim();
      // C-1: Only student and parent are self-registerable.
      // Teacher/admin accounts must be provisioned directly in the database.
      const role = ['student', 'parent'].includes(body.role) ? body.role : 'student';

      if (!username || password.length < 6)
        return send(res, 400, { error: 'Username and a password of at least 6 characters are required.' });

      const client = await pool.connect();
      try {
        await ensureTables(client);
        await client.query('BEGIN');

        const { rows } = await client.query(
          `INSERT INTO users (email, password_hash, display_name, role)
           VALUES ($1, $2, $3, $4)
           RETURNING id, email, display_name, role`,
          [username, hashPassword(password), name, role]
        );
        const user = rows[0];

        if (role === 'student') {
          await client.query(
            `INSERT INTO student_profiles (user_id, first_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [user.id, name]
          );
        }
        if (role === 'parent') {
          await client.query(
            `INSERT INTO parent_profiles (user_id, billing_email) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [user.id, username]
          );
        }
        await client.query(
          `INSERT INTO user_learning_state (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
          [user.id]
        );

        await client.query('COMMIT');
        return send(res, 201, { user: publicUser(user), progress: {}, stats: {}, token: signToken(user.id) });
      } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') return send(res, 409, { error: 'That username is already taken.' });
        throw err;
      } finally {
        client.release();
      }
    }

    // POST /api/auth/login
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const username = String(body.username || '').trim().toLowerCase();
      const client = await pool.connect();
      try {
        await ensureTables(client);
        const { rows } = await client.query(
          `SELECT id, email, password_hash, display_name, role
           FROM users WHERE email = $1 AND is_active = true`,
          [username]
        );
        const user = rows[0];
        if (!user || !verifyPassword(body.password, user.password_hash))
          return send(res, 401, { error: 'Username or password is incorrect.' });

        await client.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
        const state = await getLearningState(client, user.id);
        return send(res, 200, { user: publicUser(user), ...state, token: signToken(user.id) });
      } finally {
        client.release();
      }
    }

    // GET /api/auth/me  — validate token and return current user + state
    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const { sub: userId } = verifyToken(req);
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          `SELECT id, email, display_name, role FROM users WHERE id = $1 AND is_active = true`,
          [userId]
        );
        if (!rows[0]) return send(res, 401, { error: 'User not found.' });
        const state = await getLearningState(client, userId);
        return send(res, 200, { user: publicUser(rows[0]), ...state });
      } finally {
        client.release();
      }
    }

    // PUT /api/learning-state  — requires valid JWT
    if (req.method === 'PUT' && url.pathname === '/api/learning-state') {
      const { sub: userId } = verifyToken(req);
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO user_learning_state (user_id, progress_data, stats_data, updated_at)
           VALUES ($1, $2::jsonb, $3::jsonb, now())
           ON CONFLICT (user_id)
           DO UPDATE SET progress_data = EXCLUDED.progress_data,
                         stats_data    = EXCLUDED.stats_data,
                         updated_at    = now()`,
          [userId, JSON.stringify(body.progress || {}), JSON.stringify(body.stats || {})]
        );
        return send(res, 200, { ok: true });
      } finally {
        client.release();
      }
    }

    return send(res, 404, { error: 'Not found.' });
  } catch (err) {
    const status = err.status || 500;
    return send(res, status, { error: err.message || 'Server error.' });
  }
});

server.listen(PORT, () => console.log(`Wijs API listening on http://localhost:${PORT}`));
