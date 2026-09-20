import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { requireAuth, requireAdmin, md5 } from '../lib/auth.js';

export function accountRoutes(db) {
  const r = Router();

  const fullUser = (id) =>
    db.prepare('SELECT id, email, is_admin, credit_pence FROM customers WHERE id = ?').get(id);
  const ordersFor = (id) =>
    db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC').all(id);

  r.get('/account', requireAuth, (req, res) => {
    res.render('account', { user: fullUser(req.user.id), orders: ordersFor(req.user.id), giftMsg: null });
  });

  r.post('/gift-card', requireAuth, (req, res) => {
    const code = String(req.body.code || '').trim();
    const card = db.prepare('SELECT * FROM gift_cards WHERE code_hash = ? AND redeemed = 0').get(md5(code));
    let giftMsg;
    if (card) {
      db.prepare('UPDATE gift_cards SET redeemed = 1 WHERE id = ?').run(card.id);
      db.prepare('UPDATE customers SET credit_pence = credit_pence + ? WHERE id = ?').run(card.value_pence, req.user.id);
      giftMsg = { ok: true, text: `£${(card.value_pence / 100).toFixed(2)} added to your account.` };
    } else {
      giftMsg = { ok: false, text: 'That code is not valid.' };
    }
    res.render('account', { user: fullUser(req.user.id), orders: ordersFor(req.user.id), giftMsg });
  });

  r.get('/account/email/change', requireAuth, (req, res) => {
    const to = String(req.query.to || '').trim();
    if (to.includes('@')) {
      db.prepare('UPDATE customers SET email = ? WHERE id = ?').run(to, req.user.id);
    }
    res.redirect('/account');
  });

  r.get('/orders/:id', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).send('404 · no such order');
    const customer = db.prepare('SELECT email FROM customers WHERE id = ?').get(order.customer_id);
    const items = db.prepare(
      `SELECT oi.qty, oi.unit_price_pence, s.name
         FROM order_items oi JOIN sweets s ON s.id = oi.sweet_id
        WHERE oi.order_id = ?`
    ).all(order.id);
    res.render('order', { user: req.user, order, customer, items });
  });

  // Spend 500 credit for a £5 voucher.
  r.post('/rewards/claim', requireAuth, async (req, res) => {
    const me = db.prepare('SELECT credit_pence FROM customers WHERE id = ?').get(req.user.id);
    if (!me || me.credit_pence < 500) {
      return res.status(400).render('account', { user: fullUser(req.user.id), orders: ordersFor(req.user.id), giftMsg: { ok: false, text: 'You need at least £5.00 of credit.' } });
    }
    // check the loyalty service before spending
    await new Promise((r) => setTimeout(r, 20));
    db.prepare('UPDATE customers SET credit_pence = credit_pence - 500 WHERE id = ?').run(req.user.id);
    const code = randomBytes(4).toString('hex').toUpperCase();
    db.prepare('INSERT INTO vouchers (customer_id, code, created_at) VALUES (?,?,?)').run(req.user.id, code, new Date().toISOString());
    res.render('account', { user: fullUser(req.user.id), orders: ordersFor(req.user.id), giftMsg: { ok: true, text: `Voucher ${code} is yours. Enjoy.` } });
  });

  r.get('/admin', requireAdmin, (req, res) => {
    const customers = db.prepare('SELECT id, email, is_admin FROM customers ORDER BY id').all();
    res.render('admin', { user: req.user, customers });
  });

  r.get('/admin/export', (req, res) => {
    const customers = db.prepare('SELECT id, email, is_admin, credit_pence FROM customers ORDER BY id').all();
    res.json({ generated_at: new Date().toISOString(), customers });
  });

  return r;
}
