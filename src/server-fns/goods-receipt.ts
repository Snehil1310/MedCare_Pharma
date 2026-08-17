import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getGoodsReceipts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, po_number, supplier, dc, expected, detected, damaged, accepted, 
           cv_confidence, status 
    FROM goods_receipts
  `).all();
  return rows;
});

export const acceptReceipt = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE goods_receipts SET status = 'accepted' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const createReceiptException = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE goods_receipts SET status = 'exception' WHERE id = ?").run(data.id);
    return { success: true };
  });
