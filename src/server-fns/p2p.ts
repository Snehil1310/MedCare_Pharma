import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getP2PStages = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, status, detail FROM p2p_stages ORDER BY sort_order ASC').all();
  return rows;
});

export const getSuppliers = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, price, quality, lead_time as leadTime, reliability, score, selected FROM suppliers').all();
  return rows;
});

export const selectSupplier = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    // Deselect all, then select the chosen one
    db.prepare('UPDATE suppliers SET selected = 0').run();
    db.prepare('UPDATE suppliers SET selected = 1 WHERE id = ?').run(data.id);
    return { success: true };
  });
