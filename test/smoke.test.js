// Smoke test: the app boots and the routes respond. No exploits, no secrets.
// The real security testing is what you bring to it.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

let proc;
const PORT = 34990;
const base = `http://127.0.0.1:${PORT}`;

before(async () => {
  proc = spawn('node', ['src/server.js'], {
    env: { ...process.env, PORT: String(PORT), FF_HOST: '127.0.0.1', FF_I_KNOW_WHAT_IM_DOING: '1' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 40; i++) { try { await fetch(base + '/'); break; } catch { await sleep(150); } }
});
after(() => proc?.kill());

test('the shop loads with product art and no test-lab labels', async () => {
  const res = await fetch(base + '/');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Sweet Counter/);
  assert.match(html, /<svg/, 'sweets should render illustrations');
  assert.doesNotMatch(html, /INTENTIONALLY VULNERABLE/i, 'no lab banner in the app');
});

test('the login page loads', async () => {
  assert.equal((await fetch(base + '/login')).status, 200);
});

test('the supplier portal loads', async () => {
  const res = await fetch(base + '/supplier');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Supplier portal/);
});

test('a product page loads', async () => {
  const res = await fetch(base + '/sweet/1');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Reviews/);
});

test('protected areas require a session', async () => {
  const account = await fetch(base + '/account', { redirect: 'manual' });
  assert.equal(account.status, 302, '/account should redirect anonymous users');
  const admin = await fetch(base + '/admin', { redirect: 'manual' });
  assert.equal(admin.status, 302, '/admin should redirect anonymous users');
});

test('the register page loads', async () => {
  const res = await fetch(base + '/register');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Create an account/);
});

test('the bag page loads', async () => {
  const res = await fetch(base + '/cart');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Your bag/);
});
