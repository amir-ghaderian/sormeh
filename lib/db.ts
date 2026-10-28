
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDirectory = path.join(process.cwd(), "data");

fs.mkdirSync(dataDirectory, { recursive: true });

const databasePath = path.join(dataDirectory, "sormeh.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS product_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    fabric TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    purchase_price INTEGER NOT NULL DEFAULT 0,
    sale_price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES product_models(id),
    UNIQUE (model_id, color, size)
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier TEXT,
    total_amount INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    total_amount INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    sold_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    unit_cost INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    notes TEXT,
    spent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
