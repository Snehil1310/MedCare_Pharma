import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getTransfers = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, sku, sku_code as skuCode, from_dc as fromDc, to_dc as toDc, units, reason, status, stockout_before as stockoutBefore, stockout_after as stockoutAfter, wastage_before as wastageBefore, wastage_after as wastageAfter, service_before as serviceBefore, service_after as serviceAfter FROM transfers').all();
  return rows;
});

export const approveTransfer = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE transfers SET status = 'approved' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const rejectTransfer = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE transfers SET status = 'rejected' WHERE id = ?").run(data.id);
    return { success: true };
  });
