import express from 'express';
import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { config } from './lib/config.js';
import { safetyCheck } from './lib/safety.js';
import { seed } from './db/seed.js';
import { shopRoutes } from './routes/shop.js';
import { authRoutes } from './routes/auth.js';
import { accountRoutes } from './routes/account.js';
import { cartRoutes } from './routes/cart.js';
import { supplierRoutes } from './routes/supplier.js';
import { attachUser } from './lib/auth.js';
import { attachCart } from './lib/cart.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'freefungi.db');

await safetyCheck(config);

// Fresh, seeded database on every boot, no state to nurse.
seed(DB_PATH);
const db = new Database(DB_PATH);

const app = express();
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(express.static(join(__dirname, '..', 'public')));

// Liveness probe for the container healthcheck.
app.get('/healthz', (req, res) => res.type('text/plain').send('ok'));

app.use(attachUser(db));
app.use(attachCart);

app.use('/', authRoutes(db));
app.use('/', accountRoutes(db));
app.use('/', cartRoutes(db));
app.use('/', supplierRoutes());
app.use('/', shopRoutes(db));

// Anything unexpected returns a plain 500 rather than crashing the process.
app.use((err, req, res, next) => {
  console.error('unhandled:', err?.message || err);
  if (res.headersSent) return next(err);
  res.status(500).send('Something went wrong.');
});

const server = app.listen(config.port, config.host, () => {
  const url = `http://localhost:${config.port}`;
  console.log([
    '',
    '  🍬  SourCode — a deliberately vulnerable sweet shop',
    '  ' + '─'.repeat(48),
    `  Shop     ${url}`,
    '  Learn    https://freefungi.com/challenges',
    '',
    '  Test logins (grey-box):',
    '    alice@example.com   Password123!',
    '    bob@example.com     Hunter2day!',
    "  The admin password isn't given. You earn it.",
    '',
    '  A demo target, intentionally vulnerable. Run it locally only.',
    '',
  ].join('\n'));
});

// Shut down cleanly on a stop signal, so `docker stop` is quick.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    server.close(() => { try { db.close(); } catch {} process.exit(0); });
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
