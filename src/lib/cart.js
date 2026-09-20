import { randomBytes } from 'node:crypto';

const carts = new Map(); // cartId -> { [sweetId]: { qty, unit_price_pence } }
const COOKIE = 'ff_cart';

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function attachCart(req, res, next) {
  let id = readCookie(req, COOKIE);
  if (!id || !carts.has(id)) {
    id = randomBytes(16).toString('hex');
    carts.set(id, {});
    res.cookie(COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  req.cartId = id;
  req.cart = carts.get(id);
  res.locals = res.locals || {};
  res.locals.cartCount = Object.values(req.cart).reduce((a, it) => a + it.qty, 0);
  next();
}

export function clearCart(cartId) { carts.set(cartId, {}); }

// Build priced line items from the cart.
export function cartLines(db, cart) {
  const lines = [];
  let total = 0;
  for (const [sweetId, item] of Object.entries(cart)) {
    const sweet = db.prepare('SELECT id, name FROM sweets WHERE id = ?').get(sweetId);
    if (!sweet) continue;
    const line = item.unit_price_pence * item.qty;
    total += line;
    lines.push({ id: sweet.id, name: sweet.name, qty: item.qty, price_pence: item.unit_price_pence, line_pence: line });
  }
  return { lines, total };
}
