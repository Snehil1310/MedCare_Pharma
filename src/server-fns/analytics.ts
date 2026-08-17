import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getAnalyticsMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const procurement = db.prepare('SELECT * FROM analytics_procurement').all();
  const automation = db.prepare('SELECT * FROM analytics_automation').all();
  const finance = db.prepare('SELECT * FROM analytics_finance').all();
  
  return { procurement, automation, finance };
});
