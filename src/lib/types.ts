export type Status = "healthy" | "low" | "excess" | "stockout" | "expiry";

export type Tone = "primary" | "ok" | "warn" | "critical" | "ai" | "muted";

export const statusMeta: Record<Status, { label: string; className: string; dot: string }> = {
  healthy: { label: "Healthy", className: "bg-ok/15 text-ok border-ok/30", dot: "bg-ok" },
  low: { label: "Low Stock", className: "bg-warn/15 text-warn border-warn/30", dot: "bg-warn" },
  excess: {
    label: "Excess Stock",
    className: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    dot: "bg-chart-4",
  },
  stockout: {
    label: "Stock-out Risk",
    className: "bg-critical/15 text-critical border-critical/30",
    dot: "bg-critical",
  },
  expiry: {
    label: "Near Expiry",
    className: "bg-ai/15 text-ai border-ai/30",
    dot: "bg-ai",
  },
};

export type KpiData = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
};

export type DemandPoint = {
  month: string;
  actual: number | null;
  sensed: number | null;
  forecast: number | null;
};

export type DemandDriver = {
  icon: string;
  label: string;
  impact: number;
};

export type HealthRow = {
  label: string;
  value: number;
  status: Status;
};

export type InventoryRow = {
  id: number;
  sku: string;
  code: string;
  dc: string;
  stock: number;
  demand: string;
  daysCover: number;
  expiry: string;
  status: Status;
};

export type AiRecommendation = {
  id: number;
  tone: Tone;
  title: string;
  body: string;
  action: string;
};

export type ReplenishmentPlan = {
  id: number;
  sku: string;
  code: string;
  currentStock: number;
  forecastDemand: number;
  safetyStock: number;
  leadTime: number;
  recommendedOrder: number;
  supplier: string;
  by: string;
  serviceLevel: string;
  status: "pending" | "po_generated" | "snoozed";
};

export type Alert = {
  id: number;
  severity: "critical" | "high" | "medium";
  title: string;
  cause: string;
  impact: string;
  recommendation: string;
  owner: string;
  deadline: string;
  status: "open" | "acknowledged" | "escalated" | "resolved";
};

export type P2PStage = {
  id: number;
  name: string;
  status: "auto" | "review" | "exception";
  detail: string;
};

export type Supplier = {
  id: number;
  name: string;
  price: string;
  quality: number;
  leadTime: string;
  reliability: number;
  score: number;
  selected: boolean;
};

export type PurchaseOrder = {
  id: number;
  number: string;
  supplier: string;
  items: { name: string; qty: number; price: string }[];
  total: string;
  delivery: string;
  terms: string;
  status: "AI Generated" | "Auto-Approved" | "Approved" | "Sent to Supplier";
};

export type ExceptionItem = {
  id: string;
  severity: "critical" | "high" | "medium";
  title: string;
  reason: string;
  status: "open" | "investigating" | "resolved" | "rejected";
};

export type GoodsReceipt = {
  id: string;
  poNumber: string;
  supplier: string;
  dc: string;
  expected: number;
  detected: number;
  damaged: number;
  accepted: number;
  cvConfidence: number;
  status: "pending" | "accepted" | "exception";
};

export type InvoiceField = {
  field: string;
  value: string;
  conf: number;
};

export type ThreeWayColumn = {
  title: string;
  qty: string;
  price: string;
  ref: string;
};

export type ChatMessage = {
  id: number;
  role: "user" | "ai";
  content: string;
  timestamp: string;
};

export type SettingToggle = {
  id: number;
  label: string;
  desc: string;
  on: boolean;
};

export type SettingThreshold = {
  id: number;
  label: string;
  value: number;
  max: number;
  step: number;
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  sub?: string;
};

export type Transfer = {
  id: number;
  sku: string;
  skuCode: string;
  fromDc: string;
  toDc: string;
  units: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  stockoutBefore: string;
  stockoutAfter: string;
  wastageBefore: string;
  wastageAfter: string;
  serviceBefore: string;
  serviceAfter: string;
};
