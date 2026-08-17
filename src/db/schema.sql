-- MedCare AI Supply Chain — Database Schema

CREATE TABLE IF NOT EXISTS kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  delta TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'primary'
);

CREATE TABLE IF NOT EXISTS demand_series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL,
  actual REAL,
  sensed REAL,
  forecast REAL
);

CREATE TABLE IF NOT EXISTS demand_drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon TEXT NOT NULL,
  label TEXT NOT NULL,
  impact REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier TEXT NOT NULL, -- 'metro' or 'tier2'
  label TEXT NOT NULL,
  value REAL NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  code TEXT NOT NULL,
  dc TEXT NOT NULL,
  stock INTEGER NOT NULL,
  demand TEXT NOT NULL,
  days_cover INTEGER NOT NULL,
  expiry TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tone TEXT NOT NULL DEFAULT 'ai',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS replenishment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  code TEXT NOT NULL,
  current_stock INTEGER NOT NULL,
  forecast_demand INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  lead_time INTEGER NOT NULL,
  recommended_order INTEGER NOT NULL,
  supplier TEXT NOT NULL,
  by_date TEXT NOT NULL,
  service_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium'
  title TEXT NOT NULL,
  cause TEXT NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  owner TEXT NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS p2p_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'auto', 'review', 'exception'
  detail TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  quality REAL NOT NULL,
  lead_time TEXT NOT NULL,
  reliability REAL NOT NULL,
  score REAL NOT NULL,
  selected INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  supplier TEXT NOT NULL,
  total TEXT NOT NULL,
  delivery TEXT NOT NULL,
  terms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AI Generated'
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  po_id INTEGER NOT NULL REFERENCES purchase_orders(id),
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exceptions (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS goods_receipts (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  dc TEXT NOT NULL,
  expected INTEGER NOT NULL,
  detected INTEGER NOT NULL,
  damaged INTEGER NOT NULL,
  accepted INTEGER NOT NULL,
  cv_confidence REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  confidence REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS three_way_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  qty TEXT NOT NULL,
  price TEXT NOT NULL,
  ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'matched'
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week TEXT NOT NULL,
  auto_amount REAL NOT NULL,
  manual_amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  tone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pending_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  amount TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS analytics_procurement (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sub TEXT
);

CREATE TABLE IF NOT EXISTS analytics_automation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_finance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sub TEXT
);

CREATE TABLE IF NOT EXISTS settings_toggles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings_thresholds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  max_val INTEGER NOT NULL DEFAULT 100,
  step INTEGER NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  from_dc TEXT NOT NULL,
  to_dc TEXT NOT NULL,
  units INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stockout_before TEXT NOT NULL DEFAULT '21%',
  stockout_after TEXT NOT NULL DEFAULT '4%',
  wastage_before TEXT NOT NULL DEFAULT '₹2.4 L',
  wastage_after TEXT NOT NULL DEFAULT '₹0.6 L',
  service_before TEXT NOT NULL DEFAULT '94%',
  service_after TEXT NOT NULL DEFAULT '98%'
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  modules TEXT NOT NULL
);
