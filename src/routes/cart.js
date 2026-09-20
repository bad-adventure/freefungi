import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { clearCart, cartLines } from '../lib/cart.js';

// Merge a saved bag back into the live one.
function merge(target, source) {
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val && typeof val === 'object') {
      if (!target[key]) target[key] = {};
      merge(target[key], val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function cartRoutes(db) {
  const r = Router();

  r.get('/cart', (req, res) => {
    const { lines, total } = cartLines(db, req.cart);
    // Apply any standing discount from the shop's promo settings.
    const promo = {};
    const discount = Math.max(0, promo.discount_pence || 0);
    res.render('cart', { user: req.user, lines, total: Math.max(0, total - discount), discount });
  });

  r.post('/cart/add', (req, res) => {
    const id = String(req.body.sweet_id || '');
    const qty = Math.max(1, parseInt(req.body.qty, 10) || 1);
    const price = parseInt(req.body.price, 10);
    const sweet = db.prepare('SELECT price_pence FROM sweets WHERE id = ?').get(id);
    if (sweet) {
      const existing = req.cart[id];
      req.cart[id] = {
        qty: (existing ? existing.qty : 0) + qty,
        unit_price_pence: Number.isFinite(price) ? price : sweet.price_pence,
      };
    }
    res.redirect('/cart');
  });

  r.post('/cart/remove', (req, res) => {
    delete req.cart[String(req.body.sweet_id || '')];
    res.redirect('/cart');
  });

  // Save the bag for later into a cookie, and restore it next time.
  r.post('/bag/save', (req, res) => {
    const token = Buffer.from(JSON.stringify(req.cart)).toString('base64');
    res.cookie('ff_saved', token, { httpOnly: true, sameSite: 'lax', path: '/' });
    res.redirect('/cart');
  });

  r.get('/bag/restore', (req, res) => {
    const token = readCookie(req, 'ff_saved');
    if (token) {
      try {
        const saved = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        merge(req.cart, saved);
      } catch { /* ignore a bad saved bag */ }
    }
    res.redirect('/cart');
  });

  r.post('/checkout', requireAuth, (req, res) => {
    const { lines, total } = cartLines(db, req.cart);
    if (!lines.length) return res.redirect('/cart');

    const order = db.prepare(
      'INSERT INTO orders (customer_id, total_pence, placed_at) VALUES (?,?,?)'
    ).run(req.user.id, total, new Date().toISOString());
    const orderId = order.lastInsertRowid;

    const insItem = db.prepare(
      'INSERT INTO order_items (order_id, sweet_id, qty, unit_price_pence) VALUES (?,?,?,?)'
    );
    for (const l of lines) insItem.run(orderId, l.id, l.qty, l.price_pence);

    clearCart(req.cartId);
    res.redirect(`/orders/${orderId}`);
  });

  return r;
}
