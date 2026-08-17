import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getExceptions = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, severity, title, reason, status FROM exceptions').all();
  return rows;
});

export const resolveException = createServerFn({ method: 'POST' })
  .validator((data: { id: string; action: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE exceptions SET status = ? WHERE id = ?").run(data.action, data.id);
    return { success: true };
  });
