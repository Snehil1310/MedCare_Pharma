import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getPurchaseOrders = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const pos = db.prepare('SELECT id, number, supplier, total, delivery, terms, status FROM purchase_orders').all() as any[];
  
  // Get items for each PO
  const getItems = db.prepare('SELECT name, qty, price FROM purchase_order_items WHERE po_id = ?');
  return pos.map((po) => ({
    ...po,
    items: getItems.all(po.id) as { name: string; qty: number; price: string }[],
  }));
});

export const approvePO = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE purchase_orders SET status = 'Approved' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const sendPOToSupplier = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE purchase_orders SET status = 'Sent to Supplier' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const editPO = createServerFn({ method: 'POST' })
  .validator((data: { id: number; supplier?: string; total?: string; delivery?: string; terms?: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const fields: string[] = [];
    const values: any[] = [];
    if (data.supplier) { fields.push('supplier = ?'); values.push(data.supplier); }
    if (data.total) { fields.push('total = ?'); values.push(data.total); }
    if (data.delivery) { fields.push('delivery = ?'); values.push(data.delivery); }
    if (data.terms) { fields.push('terms = ?'); values.push(data.terms); }
    if (fields.length > 0) {
      values.push(data.id);
      db.prepare(`UPDATE purchase_orders SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    return { success: true };
  });
