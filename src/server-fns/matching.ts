import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getThreeWayMatches = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM three_way_matches').all();
  return rows;
});

export const approvePayment = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE three_way_matches SET status = 'approved' WHERE id = ?").run(data.id);
    return { success: true };
  });
