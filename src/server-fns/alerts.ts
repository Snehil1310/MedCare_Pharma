import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getAlerts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, severity, title, cause, impact, recommendation, owner, deadline, status FROM alerts').all();
  return rows;
});

export const acknowledgeAlert = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE alerts SET status = 'acknowledged' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const escalateAlert = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE alerts SET status = 'escalated' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const executeRecommendation = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE alerts SET status = 'resolved' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const getOpenAlertsCount = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const result = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE status = 'open'").get() as { c: number };
  return result;
});
