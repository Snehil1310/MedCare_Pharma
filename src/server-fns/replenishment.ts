import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getReplenishmentPlans = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, sku, code, current_stock as currentStock, forecast_demand as forecastDemand,
           safety_stock as safetyStock, lead_time as leadTime, recommended_order as recommendedOrder,
           supplier, by_date as by, service_level as serviceLevel, status
    FROM replenishment_plans
  `).all();
  return rows;
});

export const generatePO = createServerFn({ method: 'POST' })
  .validator((data: { planId: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const plan = db.prepare('SELECT * FROM replenishment_plans WHERE id = ?').get(data.planId) as any;
    if (!plan) return { success: false, error: 'Plan not found' };

    // Generate a unique PO number
    const count = db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as { c: number };
    const poNumber = `PO-2026-${String(8423 + count.c).padStart(5, '0')}`;

    // Create the PO
    const result = db.prepare(
      "INSERT INTO purchase_orders (number, supplier, total, delivery, terms, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(
      poNumber,
      plan.supplier,
      `₹${(plan.recommended_order * 6).toLocaleString('en-IN')}`,
      plan.by_date,
      'Net 30',
      'AI Generated'
    );

    // Add PO item
    db.prepare(
      "INSERT INTO purchase_order_items (po_id, name, qty, price) VALUES (?, ?, ?, ?)"
    ).run(result.lastInsertRowid, plan.sku, plan.recommended_order, `₹6/unit`);

    // Mark plan as generated
    db.prepare("UPDATE replenishment_plans SET status = 'po_generated' WHERE id = ?").run(data.planId);

    return { success: true, poNumber };
  });

export const snoozePlan = createServerFn({ method: 'POST' })
  .validator((data: { planId: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE replenishment_plans SET status = 'snoozed' WHERE id = ?").run(data.planId);
    return { success: true };
  });
