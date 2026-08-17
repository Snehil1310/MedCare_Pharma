import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getInvoiceFields = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  const rows = db.prepare('SELECT id, invoice_number, field_name, field_value, confidence FROM invoices WHERE invoice_number = ?').all('INV-9832');
  return rows;
});
