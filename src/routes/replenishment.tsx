import { createFileRoute } from "@tanstack/react-router";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReplenishmentPlans, generatePO, snoozePlan } from "@/server-fns/replenishment";
import { toast } from "sonner";
import { type ReplenishmentPlan } from "@/lib/types";

export const Route = createFileRoute("/replenishment")({
  head: () => ({
    meta: [
      { title: "AI Replenishment — MedCare Pharma" },
      {
        name: "description",
        content:
          "Automated replenishment plans combining forecast demand, safety stock, lead time and current inventory into ready-to-issue purchase orders.",
      },
      { property: "og:title", content: "AI Replenishment — MedCare Pharma" },
      {
        property: "og:description",
        content: "Forecast + safety stock + lead time − inventory, turned into an order proposal.",
      },
    ],
  }),
  component: Replenishment,
});

function Replenishment() {
  const queryClient = useQueryClient();
  const { data: replenishmentPlans = [] } = useQuery({ queryKey: ["replenishmentPlans"], queryFn: () => getReplenishmentPlans() });

  const generateMutation = useMutation({
    mutationFn: (data: { planId: number }) => generatePO({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replenishmentPlans"] });
      toast.success("PO Generated");
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: (data: { planId: number }) => snoozePlan({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replenishmentPlans"] });
      toast.success("Plan snoozed");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 · Replenishment Planning"
        title="AI Replenishment"
        description="Forecast demand + safety stock + lead time − current inventory = recommended order quantity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Plans generated" value="46" delta="Today" tone="ai" />
        <KpiCard label="Order value" value="₹32.4 L" delta="Awaiting release" tone="primary" />
        <KpiCard label="Target service level" value="95%" delta="Network default" tone="ok" />
        <KpiCard label="Late-risk SKUs" value="7" delta="Lead time > cover" tone="critical" />
      </div>

      <div className="space-y-4">
        {replenishmentPlans.filter((p: ReplenishmentPlan) => p.status === "pending").map((p: ReplenishmentPlan) => (
          <Panel key={p.code} title={p.sku} subtitle={`SKU ${p.code} · Supplier ${p.supplier}`}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric label="Current stock" value={p.currentStock.toLocaleString("en-IN")} />
              <Metric label="Forecast demand" value={p.forecastDemand.toLocaleString("en-IN")} />
              <Metric label="Safety stock" value={p.safetyStock.toLocaleString("en-IN")} />
              <Metric label="Lead time" value={`${p.leadTime} days`} />
              <Metric
                label="Recommended order"
                value={p.recommendedOrder.toLocaleString("en-IN")}
                highlight
              />
            </div>
            <div className="mt-4 rounded-xl border border-ai/30 bg-ai/10 p-4 text-sm">
              <Pill tone="ai">AI recommendation</Pill>
              <p className="mt-2">
                Order <b>{p.recommendedOrder.toLocaleString("en-IN")} units</b> from {p.supplier} by{" "}
                {p.by} to maintain a {p.serviceLevel} service level.
              </p>
            </div>
            <div className="mt-4">
              <ActionRow 
                labels={["Generate PO", "Review", "Snooze"]} 
                onAction={(label) => {
                  if (label === "Generate PO") generateMutation.mutate({ planId: p.id });
                  else if (label === "Snooze") snoozeMutation.mutate({ planId: p.id });
                }}
              />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-primary/30 bg-primary/10 p-3"
          : "rounded-xl border border-border bg-surface-2 p-3"
      }
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-lg ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
