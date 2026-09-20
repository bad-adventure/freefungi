DROP TABLE IF EXISTS sweets;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS gift_cards;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS vouchers;

CREATE TABLE sweets (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price_pence INTEGER NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE customers (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  credit_pence  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_pence INTEGER NOT NULL,
  placed_at   TEXT NOT NULL
);

CREATE TABLE order_items (
  id              INTEGER PRIMARY KEY,
  order_id        INTEGER NOT NULL,
  sweet_id        INTEGER NOT NULL,
  qty             INTEGER NOT NULL,
  unit_price_pence INTEGER NOT NULL
);

CREATE TABLE gift_cards (
  id          INTEGER PRIMARY KEY,
  code_hash   TEXT NOT NULL,
  value_pence INTEGER NOT NULL,
  redeemed    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY,
  sweet_id   INTEGER NOT NULL,
  author     TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE vouchers (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  code        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
