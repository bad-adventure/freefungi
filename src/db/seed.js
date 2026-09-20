import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// All data here is fabricated. Emails use example.com.
const sweets = [
  ['Rhubarb & Custard', 'Boiled', 120, 'A tart-and-creamy classic. Do not underestimate it.'],
  ['Sherbet Lemons',    'Sour',   110, 'A sharp lemon shell hiding a fizz of sherbet.'],
  ['Aniseed Balls',     'Boiled',  95, 'Small, relentless, faintly medicinal.'],
  ['Pear Drops',        'Boiled', 115, 'Smells of nail varnish. Tastes of childhood.'],
  ['Chocolate Limes',   'Boiled', 125, 'A hard lime shell, a soft chocolate secret.'],
  ['Flying Saucers',    'Novelty',130, 'Rice paper and a sherbet payload.'],
  ['Liquorice Torpedoes','Liquorice',140,'An acquired taste, aggressively acquired.'],
  ['Bonbons (Strawberry)','Chewy',135, 'Dusted, squishy, dangerous in quantity.'],
  ['Kola Kubes',        'Boiled', 105, 'Cube-shaped, cola-flavoured, jaw-defeating.'],
  ['Parma Violets',     'Novelty', 90, 'Perfume you are allowed to eat.'],
  ['Humbugs',           'Boiled', 100, 'Stripy, minty, faintly Victorian.'],
  ['Fudge (Clotted Cream)','Fudge',150,'Made this morning. Gone by lunch.'],
  ['Sour Cherries',     'Sour',   105, 'A cherry so sharp it makes your jaw ache. In a good way.'],
  ['Fizzy Cola Bottles','Sour',    95, 'Sour-dusted, fizzing, and gone in three bites.'],
  ['Sour Apple Bonbons','Sour',   110, 'Green, dusted, and unapologetically tart.'],
];

// email, password_hash, is_admin
const customers = [
  ['ada@example.com',   '0571749e2ac330a7455809c6b0e7af90', 0],
  ['grace@example.com', '7c6a180b36896a0a8c02787eeafb0e4c', 0],
  ['alan@example.com',  '90954349a0e42d8e4426a4672bde16b9', 0],
  ['alice@example.com', '2c103f2c4ed1e59c0b4e2e01821770fa', 0],
  ['bob@example.com',   'd5afe90ce8f0d16b20b25b405d2ac07a', 0],
  ['owner@example.com', '965b9154fb1eb0f0454bdf07b4a518bc', 1],
];

export function seed(dbPath = join(__dirname, '..', '..', 'freefungi.db')) {
  const db = new Database(dbPath);
  db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));

  const insSweet = db.prepare('INSERT INTO sweets (name, category, price_pence, description) VALUES (?,?,?,?)');
  for (const s of sweets) insSweet.run(...s);

  const insCust = db.prepare('INSERT INTO customers (email, password_hash, is_admin) VALUES (?,?,?)');
  for (const c of customers) insCust.run(...c);
  db.prepare("UPDATE customers SET credit_pence = 500 WHERE email IN ('alice@example.com','bob@example.com')").run();

  const insOrder = db.prepare('INSERT INTO orders (customer_id, total_pence, placed_at) VALUES (?,?,?)');
  const insItem = db.prepare('INSERT INTO order_items (order_id, sweet_id, qty, unit_price_pence) VALUES (?,?,?,?)');

  // order 1 belongs to ada, order 2 to grace, order 3 to alan
  const o1 = insOrder.run(1, 340, '2026-08-01T10:15:00Z').lastInsertRowid;
  insItem.run(o1, 1, 2, 120); // 2x Rhubarb & Custard
  insItem.run(o1, 11, 1, 100); // 1x Humbugs
  const o2 = insOrder.run(2, 225, '2026-08-03T14:40:00Z').lastInsertRowid;
  insItem.run(o2, 5, 1, 125); // 1x Chocolate Limes
  insItem.run(o2, 10, 1, 90);  // 1x Parma Violets  (note: 215; total left as seeded)
  const o3 = insOrder.run(3, 150, '2026-08-05T09:05:00Z').lastInsertRowid;
  insItem.run(o3, 12, 1, 150); // 1x Fudge
  const o4 = insOrder.run(4, 220, '2026-08-07T16:20:00Z').lastInsertRowid;
  insItem.run(o4, 8, 1, 135); // 1x Bonbons
  insItem.run(o4, 3, 1, 95);  // 1x Aniseed Balls
  const o5 = insOrder.run(5, 110, '2026-08-08T11:00:00Z').lastInsertRowid;
  insItem.run(o5, 2, 1, 110); // 1x Sherbet Lemons

  const insCard = db.prepare('INSERT INTO gift_cards (code_hash, value_pence) VALUES (?,?)');
  insCard.run('477afc687c494ae72a83758f185df0de', 500);
  insCard.run('7b5a05c985a81001ee63a5ccc36a0966', 300);
  insCard.run('7e6679a2afd5c6475ec012454619b76f', 1000);

  const insReview = db.prepare('INSERT INTO reviews (sweet_id, author, body, created_at) VALUES (?,?,?,?)');
  insReview.run(1, 'grace@example.com', 'Tastes exactly like my nan\'s. Five stars.', '2026-08-02T09:00:00Z');
  insReview.run(1, 'alan@example.com', 'A bit sharp for me but the kids love them.', '2026-08-04T18:30:00Z');
  insReview.run(12, 'ada@example.com', 'Gone before I got home. Buy two bags.', '2026-08-06T12:00:00Z');

  db.close();
  return dbPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Seeded', seed());
}
