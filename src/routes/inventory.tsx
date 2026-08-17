import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { statusMeta, type Status } from "@/lib/types";
import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/server-fns/inventory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Control — MedCare Pharma" },
      {
        name: "description",
        content:
          "SKU-level inventory health across every distribution centre with days of cover, expiry windows and risk status.",
      },
      { property: "og:title", content: "Inventory Control — MedCare Pharma" },
      {
        property: "og:description",
        content: "Days of cover, expiry exposure and stock-out risk for every SKU and DC.",
      },
    ],
  }),
  component: Inventory,
});

const tone = (s: Status) =>
  s === "healthy" ? "ok" : s === "low" || s === "excess" ? "warn" : s === "expiry" ? "ai" : "critical";

function Inventory() {
  const { data: inventoryRows = [] } = useQuery({ queryKey: ['inventoryItems'], queryFn: () => getInventoryItems() });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 · Inventory Health"
        title="Inventory Control"
        description="Live inventory position across all distribution centres, scored against sensed demand."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="SKUs tracked" value="1,284" delta="6 distribution centres" tone="primary" />
        <KpiCard label="Avg days of cover" value="21" delta="Target 28" tone="warn" />
        <KpiCard label="Stock-out risk" value="27 SKUs" delta="Next 7 days" tone="critical" />
        <KpiCard label="Near expiry value" value="₹4.1 L" delta="60-day window" tone="ai" />
      </div>

      <Panel
        title="Inventory position"
        subtitle="Status derived from days of cover, sensed demand and shelf life"
        right={
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(statusMeta) as Status[]).map((s) => (
              <Pill key={s} tone={tone(s)}>
                {statusMeta[s].label}
              </Pill>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>DC</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Demand</TableHead>
                <TableHead className="text-right">Days cover</TableHead>
                <TableHead className="text-right">Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryRows.map((r) => (
                <TableRow key={r.code + r.dc}>
                  <TableCell>
                    <div className="font-medium">{r.sku}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{r.code}</div>
                  </TableCell>
                  <TableCell>{r.dc}</TableCell>
                  <TableCell className="text-right font-mono">
                    {r.stock.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono">{r.demand}</TableCell>
                  <TableCell className="text-right font-mono">{r.daysCover}</TableCell>
                  <TableCell className="text-right font-mono">{r.expiry}</TableCell>
                  <TableCell>
                    <Pill tone={tone(r.status)}>{statusMeta[r.status].label}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
