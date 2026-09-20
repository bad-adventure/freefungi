import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sweetArt } from '../lib/sweet-art.js';
import { requireAuth } from '../lib/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const allergensDir = join(__dirname, '..', '..', 'allergens');

export function shopRoutes(db) {
  const r = Router();

  r.get('/', (req, res) => {
    const sweets = db.prepare('SELECT * FROM sweets ORDER BY category, name').all();
    res.render('index', { sweets, q: '', qEcho: '', results: null, error: null, user: req.user, art: sweetArt });
  });

  r.get('/search', (req, res) => {
    const q = req.query.q ?? '';
    const sweets = db.prepare('SELECT * FROM sweets ORDER BY category, name').all();
    let results = null, error = null;
    try {
      const sql = `SELECT name, price_pence FROM sweets WHERE name LIKE '%${q}%'`;
      results = db.prepare(sql).all();
    } catch (e) {
      error = String(e.message || e);
    }
    res.render('index', { sweets, q, qEcho: q, results, error, user: req.user, art: sweetArt });
  });

  r.get('/api/sweets/search', (req, res) => {
    const q = req.query.q ?? '';
    try {
      const sql = `SELECT name, price_pence FROM sweets WHERE name LIKE '%${q}%'`;
      res.json(db.prepare(sql).all());
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  r.get('/sweet/:id', (req, res) => {
    const sweet = db.prepare('SELECT * FROM sweets WHERE id = ?').get(req.params.id);
    if (!sweet) return res.status(404).send('404 · no such sweet');
    const reviews = db.prepare('SELECT * FROM reviews WHERE sweet_id = ? ORDER BY id DESC').all(sweet.id);
    res.render('sweet', { sweet, reviews, user: req.user, art: sweetArt });
  });

  r.post('/sweet/:id/review', requireAuth, (req, res) => {
    const sweet = db.prepare('SELECT id FROM sweets WHERE id = ?').get(req.params.id);
    if (sweet) {
      db.prepare('INSERT INTO reviews (sweet_id, author, body, created_at) VALUES (?,?,?,?)')
        .run(sweet.id, req.user.email, String(req.body.body || ''), new Date().toISOString());
    }
    res.redirect(`/sweet/${req.params.id}`);
  });

  r.get('/allergens', (req, res) => {
    const sheet = String(req.query.sheet || '');
    try {
      const body = readFileSync(join(allergensDir, sheet), 'utf8');
      res.type('text/plain').send(body);
    } catch {
      res.status(404).send('Allergen sheet not found.');
    }
  });

  // Live stock check for a sweet. Returns only whether it is in stock.
  r.get('/api/stock', (req, res) => {
    const id = req.query.id ?? '';
    try {
      const row = db.prepare(`SELECT COUNT(*) AS n FROM sweets WHERE id = ${id} AND price_pence > 0`).get();
      res.json({ in_stock: row.n > 0 });
    } catch {
      res.json({ in_stock: false });
    }
  });

  // Delivery tracking: fetch the courier's page for a parcel.
  r.get('/track', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).send('Give a tracking URL.');
    try {
      const upstream = await fetch(url);
      const body = await upstream.text();
      res.type('text/plain').send(body.slice(0, 4000));
    } catch {
      res.status(502).send('Could not reach the courier.');
    }
  });

  return r;
}
