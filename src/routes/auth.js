import { Router } from 'express';
import { md5, createSession, setSessionCookie, clearSessionCookie } from '../lib/auth.js';

export function authRoutes(db) {
  const r = Router();

  r.get('/login', (req, res) => {
    res.render('login', { user: req.user, error: null, email: '' });
  });

  r.post('/login', (req, res) => {
    const { email = '', password = '' } = req.body;
    const user = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
    if (!user || user.password_hash !== md5(password)) {
      return res.status(401).render('login', { user: null, error: 'Wrong email or password.', email });
    }
    setSessionCookie(res, createSession(user));
    res.redirect(user.is_admin ? '/admin' : '/account');
  });

  r.get('/register', (req, res) => {
    res.render('register', { user: req.user, error: null, email: '' });
  });

  r.post('/register', (req, res) => {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');
    const err = (m) => res.status(400).render('register', { user: null, error: m, email });
    if (!email.includes('@') || password.length < 4) {
      return err('Enter an email and a password of at least 4 characters.');
    }
    if (db.prepare('SELECT 1 FROM customers WHERE email = ?').get(email)) {
      return err('That email is already registered.');
    }
    const info = db.prepare(
      'INSERT INTO customers (email, password_hash, is_admin) VALUES (?,?,0)'
    ).run(email, md5(password));
    setSessionCookie(res, createSession({ id: info.lastInsertRowid, email }));
    res.redirect('/account');
  });

  r.post('/logout', (req, res) => {
    clearSessionCookie(res);
    res.redirect('/');
  });

  return r;
}
