import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';

export const getCommandCenterData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb();
  
  // Get specific KPIs for command center
  const openPlans = db.prepare("SELECT COUNT(*) as c FROM replenishment_plans WHERE status = 'pending'").get() as { c: number };
  const pendingTransfers = db.prepare("SELECT COUNT(*) as c FROM transfers WHERE status = 'pending'").get() as { c: number };
  const criticalAlerts = db.prepare("SELECT COUNT(*) as c FROM alerts WHERE severity = 'critical' AND status = 'open'").get() as { c: number };
  
  const kpis = [
    { label: "Open AI plans", value: String(openPlans.c + pendingTransfers.c), delta: `${pendingTransfers.c} awaiting approval`, tone: "ai" },
    { label: "Autonomy level", value: "87%", delta: "Rule-based bypass on", tone: "ok" },
    { label: "Value at risk", value: "₹6.8 L", delta: "Next 72 hours", tone: "critical" },
    { label: "Projected savings", value: "₹18.4 L", delta: "If all executed", tone: "primary" },
  ];

  // Get transfers for action items
  const transfers = db.prepare("SELECT * FROM transfers WHERE status = 'pending'").all();
  
  return { kpis, transfers, criticalAlerts: criticalAlerts.c };
});

export const executeAllActions = createServerFn({ method: 'POST' }).handler(async () => {
  const db = getDb();
  
  // Approve all pending transfers
  db.prepare("UPDATE transfers SET status = 'approved' WHERE status = 'pending'").run();
  
  // Get threshold from settings
  const thresholdRow = db.prepare("SELECT value FROM settings_thresholds WHERE label LIKE 'Auto-approval limit%'").get() as any;
  const thresholdVal = thresholdRow ? thresholdRow.value * 1000 : 100000;

  // Generate POs for pending replenishment plans
  const pendingPlans = db.prepare("SELECT * FROM replenishment_plans WHERE status = 'pending'").all() as any[];
  for (const plan of pendingPlans) {
    const count = db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as { c: number };
    const poNumber = `PO-2026-${String(8423 + count.c).padStart(5, '0')}`;
    
    const totalCost = plan.recommended_order * 6; // estimating
    const status = totalCost <= thresholdVal ? 'Auto-Approved' : 'AI Generated';
    
    const result = db.prepare(
      "INSERT INTO purchase_orders (number, supplier, total, delivery, terms, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(poNumber, plan.supplier, `₹${totalCost.toLocaleString('en-IN')}`, plan.by_date, 'Net 30', status);
    
    db.prepare("INSERT INTO purchase_order_items (po_id, name, qty, price) VALUES (?, ?, ?, ?)").run(
      result.lastInsertRowid, plan.sku, plan.recommended_order, '₹6/unit'
    );
    
    db.prepare("UPDATE replenishment_plans SET status = 'po_generated' WHERE id = ?").run(plan.id);
  }
  
  // Specific action for the Flu-season Paracetamol surge card
  // Check if we already created it to avoid duplicates if executed multiple times
  const surgePoCount = db.prepare("SELECT COUNT(*) as c FROM purchase_orders WHERE supplier = 'Supplier C' AND total = '₹6,80,000'").get() as { c: number };
  if (surgePoCount.c === 0) {
    const count = db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as { c: number };
    const poNumber = `PO-2026-${String(8423 + count.c).padStart(5, '0')}`;
    
    const surgeCost = 680000;
    const status = surgeCost <= thresholdVal ? 'Auto-Approved' : 'AI Generated';
    
    const result = db.prepare(
      "INSERT INTO purchase_orders (number, supplier, total, delivery, terms, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(poNumber, 'Supplier C', '₹6,80,000', '3 days', 'Net 30', status);
    
    db.prepare("INSERT INTO purchase_order_items (po_id, name, qty, price) VALUES (?, ?, ?, ?)").run(
      result.lastInsertRowid, 'Paracetamol 500mg', 8000, '₹85/unit'
    );
  }
  
  // Resolve critical alerts
  db.prepare("UPDATE alerts SET status = 'resolved' WHERE severity = 'critical' AND status = 'open'").run();
  
  return { success: true };
});

export const executeIndividualAction = createServerFn({ method: 'POST' })
  .validator((data: { actionType: string }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const thresholdRow = db.prepare("SELECT value FROM settings_thresholds WHERE label LIKE 'Auto-approval limit%'").get() as any;
    const thresholdVal = thresholdRow ? thresholdRow.value * 1000 : 100000;
    
    if (data.actionType === 'transfer') {
      db.prepare("UPDATE transfers SET status = 'approved' WHERE status = 'pending'").run();
    } else if (data.actionType === 'po') {
      const surgePoCount = db.prepare("SELECT COUNT(*) as c FROM purchase_orders WHERE supplier = 'Supplier C' AND total = '₹6,80,000'").get() as { c: number };
      if (surgePoCount.c === 0) {
        const count = db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as { c: number };
        const poNumber = `PO-2026-${String(8423 + count.c).padStart(5, '0')}`;
        
        const surgeCost = 680000;
        const status = surgeCost <= thresholdVal ? 'Auto-Approved' : 'AI Generated';
        
        const result = db.prepare(
          "INSERT INTO purchase_orders (number, supplier, total, delivery, terms, status) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(poNumber, 'Supplier C', '₹6,80,000', '3 days', 'Net 30', status);
        
        db.prepare("INSERT INTO purchase_order_items (po_id, name, qty, price) VALUES (?, ?, ?, ?)").run(
          result.lastInsertRowid, 'Paracetamol 500mg', 8000, '₹85/unit'
        );
      }
    }
    
    return { success: true };
});
