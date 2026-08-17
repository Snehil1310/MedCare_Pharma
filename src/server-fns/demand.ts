import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getDemandSeries = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM demand_series').all();
  return rows;
});

export const getDemandDrivers = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM demand_drivers').all();
  return rows;
});
