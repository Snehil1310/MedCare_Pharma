import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getInventoryItems = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, sku, code, dc, stock, demand, days_cover as daysCover, expiry, status FROM inventory_items').all();
  return rows;
});

export const getInventoryHealth = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const metro = db.prepare("SELECT label, value, status FROM inventory_health WHERE tier = 'metro'").all();
  const tier2 = db.prepare("SELECT label, value, status FROM inventory_health WHERE tier = 'tier2'").all();
  return { metro, tier2 };
});
