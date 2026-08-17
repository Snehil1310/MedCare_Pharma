import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getPaymentSummary = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT label, value, tone FROM payment_summary').all();
  return rows;
});

export const getWeeklyPayments = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT week, auto_amount as auto, manual_amount as manual FROM payments').all();
  return rows;
});

export const getPendingPayments = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM pending_payments WHERE status = 'pending'").all();
  return rows;
});

export const approvePendingPayment = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE pending_payments SET status = 'approved' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const declinePendingPayment = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE pending_payments SET status = 'declined' WHERE id = ?").run(data.id);
    return { success: true };
  });

export const generatePaymentReceipt = createServerFn({ method: 'POST' })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    db.prepare("UPDATE pending_payments SET status = 'receipt_generated' WHERE id = ?").run(data.id);
    return { success: true };
  });
