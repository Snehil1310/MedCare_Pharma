import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const toggles = db.prepare('SELECT id, label, description as desc, enabled as "on" FROM settings_toggles').all();
  const thresholds = db.prepare('SELECT id, label, value, max_val as "max", step FROM settings_thresholds').all();
  const roles = db.prepare('SELECT id, role, modules FROM roles').all();
  
  // Convert enabled (0/1) to boolean for toggles
  const formattedToggles = (toggles as any[]).map(t => ({ ...t, on: !!t.on }));
  
  return { toggles: formattedToggles, thresholds, roles };
});

export const updateToggle = createServerFn({ method: 'POST' })
  .validator((data: { id: number; enabled: boolean }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare('UPDATE settings_toggles SET enabled = ? WHERE id = ?').run(data.enabled ? 1 : 0, data.id);
    return { success: true };
  });

export const updateThreshold = createServerFn({ method: 'POST' })
  .validator((data: { id: number; value: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare('UPDATE settings_thresholds SET value = ? WHERE id = ?').run(data.value, data.id);
    return { success: true };
  });
