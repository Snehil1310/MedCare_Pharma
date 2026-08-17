import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getExecutiveKpis = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT label, value, delta, tone FROM kpis').all();
  return rows;
});

export const getAiRecommendations = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, tone, title, body, action FROM ai_recommendations').all();
  return rows;
});

export const executeRecommendation = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare('DELETE FROM ai_recommendations WHERE id = ?').run(data.id);
    return { success: true };
  });

export const dismissRecommendation = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare('DELETE FROM ai_recommendations WHERE id = ?').run(data.id);
    return { success: true };
  });
