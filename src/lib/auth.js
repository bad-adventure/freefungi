import { createHash, createHmac } from 'node:crypto';

const COOKIE = 'ff_session';
const SIGNING_KEY = process.env.FF_SIGNING_KEY || 'sweetshop';

export const md5 = (s) => createHash('md5').update(String(s)).digest('hex');

const b64 = (s) => Buffer.from(s).toString('base64url');
const unb64 = (s) => Buffer.from(String(s), 'base64url').toString('utf8');

// The session cookie is a signed token carrying the user id.
export function createSession(user) {
  const payload = b64(JSON.stringify({ uid: user.id, email: user.email }));
  const sig = createHmac('sha256', SIGNING_KEY).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function destroySession() {}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function attachUser(db) {
  return (req, res, next) => {
    const token = readCookie(req, COOKIE);
    let user = null;
    if (token) {
      try {
        const [payload] = token.split('.');
        const { uid } = JSON.parse(unb64(payload));
        user = db.prepare('SELECT id, email, is_admin FROM customers WHERE id = ?').get(uid);
      } catch { user = null; }
    }
    req.user = user;
    res.locals = res.locals || {};
    res.locals.user = req.user;
    next();
  };
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/' });
}
export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}
export function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect('/login');
  if (!req.user.is_admin) return res.status(403).send('403 · staff only');
  next();
}
