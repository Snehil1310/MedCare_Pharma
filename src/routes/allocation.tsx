import { createFileRoute } from "@tanstack/react-router";
import { AiCard, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { ArrowDown, ArrowRight } from "lucide-react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransfers, approveTransfer, rejectTransfer } from "@/server-fns/allocation";
import { toast } from "sonner";
import { type Transfer } from "@/lib/types";

export const Route = createFileRoute("/allocation")({
  head: () => ({
    meta: [
      { title: "Smart Allocation — MedCare Pharma" },
      {
        name: "description",
        content:
          "Expiry-aware stock reallocation between distribution centres, with projected impact on stock-out risk, wastage and service level.",
      },
      { property: "og:title", content: "Smart Allocation — MedCare Pharma" },
      {
        property: "og:description",
        content: "Move expiring stock to high-demand DCs before it becomes wastage.",
      },
    ],
  }),
  component: Allocation,
});

const nodes = [
  { dc: "Delhi", units: "1,200", note: "Balanced", tone: "ok" as const },
  { dc: "Mumbai", units: "3,400", note: "Expiring in 42d", tone: "ai" as const },
  { dc: "Vellore", units: "800", note: "High sensed demand", tone: "critical" as const },
];

function Allocation() {
  const queryClient = useQueryClient();
  const { data: transfers = [] } = useQuery({ queryKey: ["transfers"], queryFn: () => getTransfers() });

  const approveMutation = useMutation({
    mutationFn: (data: { id: number }) => approveTransfer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer approved");
    },
    onError: () => toast.error("Failed to approve transfer"),
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { id: number }) => rejectTransfer({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer rejected");
    },
    onError: () => toast.error("Failed to reject transfer"),
  });

  const pendingTransfers = transfers.filter((t: Transfer) => t.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 · Expiry-Aware Allocation"
        title="Smart Allocation"
        description="The AI rebalances stock across the network using shelf life, sensed demand and transfer cost together."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Transfers proposed" value="9" delta="This week" tone="ai" />
        <KpiCard label="Units rebalanced" value="14,800" delta="Month to date" tone="primary" />
        <KpiCard label="Wastage avoided" value="₹6.2 L" delta="FY to date" tone="ok" />
        <KpiCard label="Awaiting approval" value="3" delta="Deadline today" tone="warn" />
      </div>

      <Panel title="Network view" subtitle="Batch age vs. sensed demand across distribution centres">
        <div className="grid gap-4 md:grid-cols-3">
          {nodes.map((n) => (
            <div key={n.dc} className="rounded-xl border border-border bg-surface-2 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{n.dc}</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{n.units}</p>
              <div className="mt-2 flex justify-center">
                <Pill tone={n.tone}>{n.note}</Pill>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          <span className="text-foreground">Delhi</span>
          <ArrowDown className="size-4" />
          <span className="text-foreground">Mumbai (expiring)</span>
          <ArrowRight className="size-4" />
          <span className="text-foreground">Vellore (high demand)</span>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        {pendingTransfers.map((t: Transfer) => (
          <React.Fragment key={t.id}>
            <AiCard
              tone="ai"
              title="Recommended action"
              actions={[
                { label: "Approve Transfer", onClick: () => approveMutation.mutate({ id: t.id }) },
                { label: "Modify", variant: "outline" },
                { label: "Reject", variant: "outline", onClick: () => rejectMutation.mutate({ id: t.id }) },
              ]}
            >
              <p className="text-foreground">
                Transfer <b>{t.units.toLocaleString("en-IN")} units</b> of SKU <span className="font-mono">{t.skuCode}</span>
              </p>
              <p>
                From: <span className="text-foreground">{t.fromDc}</span> · To:{" "}
                <span className="text-foreground">{t.toDc}</span>
              </p>
              <p>
                Reason: {t.reason}
              </p>
            </AiCard>

            <Panel className="lg:col-span-2" title="Expected impact">
              <div className="grid gap-4 sm:grid-cols-3">
                <ImpactCard label="Stock-out probability" from={t.stockoutBefore} to={t.stockoutAfter} />
                <ImpactCard label="Expiry wastage" from={t.wastageBefore} to={t.wastageAfter} />
                <ImpactCard label="Service level" from={t.serviceBefore} to={t.serviceAfter} positive />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Transfer cost ₹18,400 · Transit 2 days · Net benefit ₹1.62 L
              </p>
            </Panel>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ImpactCard({
  label,
  from,
  to,
  positive,
}: {
  label: string;
  from: string;
  to: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className={positive ? "text-warn" : "text-critical"}>{from}</span>
        <ArrowRight className="size-3.5 text-muted-foreground" />
        <span className="text-lg font-semibold text-ok">{to}</span>
      </div>
    </div>
  );
}
