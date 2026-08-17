import { createFileRoute } from "@tanstack/react-router";
import { ActionRow, Bar, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoodsReceipts, acceptReceipt, createReceiptException } from "@/server-fns/goods-receipt";
import { toast } from "sonner";

export const Route = createFileRoute("/goods-receipt")({
  head: () => ({
    meta: [
      { title: "Goods Receiving — MedCare Pharma" },
      {
        name: "description",
        content:
          "Computer-vision and IoT verified goods receipt with quantity reconciliation, damage detection and exception routing.",
      },
      { property: "og:title", content: "Goods Receiving — MedCare Pharma" },
      {
        property: "og:description",
        content: "CV-verified receipts that reconcile against the PO in seconds.",
      },
    ],
  }),
  component: GoodsReceipt,
});

function GoodsReceipt() {
  const queryClient = useQueryClient();

  const { data: receipts = [] } = useQuery({
    queryKey: ["goods_receipts"],
    queryFn: () => getGoodsReceipts(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptReceipt({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods_receipts"] });
      toast.success("Receipt accepted");
    },
    onError: () => toast.error("Failed to accept receipt"),
  });

  const exceptionMutation = useMutation({
    mutationFn: (id: string) => createReceiptException({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods_receipts"] });
      toast.success("Exception created");
    },
    onError: () => toast.error("Failed to create exception"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Intelligent Goods Receipt"
        title="Goods Receiving"
        description="Simulated IoT and computer-vision capture at the dock, reconciled against the purchase order automatically."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Shipments today" value="24" delta="21 clean receipts" tone="primary" />
        <KpiCard label="CV accuracy" value="97.8%" delta="Rolling 30 days" tone="ai" />
        <KpiCard label="Damage detected" value="3 pkgs" delta="Auto-claimed" tone="warn" />
        <KpiCard label="Receipt time" value="2.4 min" delta="was 45 min" tone="ok" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {receipts.map((receipt: any) => (
          <Panel
            key={receipt.id}
            className="lg:col-span-2"
            title={`Shipment #${receipt.id}`}
            subtitle={`${receipt.po_number} · MedSupply Pvt Ltd · Vellore DC`}
            right={<Pill tone={receipt.status === "accepted" ? "ok" : receipt.status === "exception" ? "critical" : "warn"}>{receipt.status === "pending" ? "Requires Review" : receipt.status.toUpperCase()}</Pill>}
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Expected" value={`${receipt.expected} units`} />
              <Stat label="Detected" value={`${receipt.detected} units`} tone="warn" />
              <Stat label="Damaged" value={`${receipt.damaged} units`} tone="critical" />
              <Stat label="Accepted" value={`${receipt.accepted} units`} tone="ok" />
            </div>

            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Computer vision confidence</span>
                <span className="font-mono text-ai">{receipt.cv_confidence}%</span>
              </div>
              <Bar value={receipt.cv_confidence} tone="ai" />
            </div>

            <div className="mt-5">
              <ActionRow 
                labels={["Accept", "Create Exception", "Request Supplier Action"]} 
                onAction={(label) => {
                  if (label === "Accept") acceptMutation.mutate(receipt.id);
                  if (label === "Create Exception") exceptionMutation.mutate(receipt.id);
                  if (label === "Request Supplier Action") toast.success("Requested supplier action");
                }}
              />
            </div>
          </Panel>
        ))}

        <Panel title="AI detection log">
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-warn/30 bg-warn/10 p-3">
              📦 Quantity mismatch — 2 units short of PO quantity.
            </li>
            <li className="rounded-lg border border-critical/30 bg-critical/10 p-3">
              ⚠️ 3 damaged packages detected on pallet 4.
            </li>
            <li className="rounded-lg border border-ai/30 bg-ai/10 p-3">
              📷 Computer vision verified batch labels and expiry dates.
            </li>
            <li className="rounded-lg border border-ok/30 bg-ok/10 p-3">
              🌡 Cold-chain sensor within range for the entire transit.
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: "primary" | "ok" | "warn" | "critical";
}) {
  const cls = {
    primary: "text-foreground",
    ok: "text-ok",
    warn: "text-warn",
    critical: "text-critical",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-lg ${cls}`}>{value}</p>
    </div>
  );
}
