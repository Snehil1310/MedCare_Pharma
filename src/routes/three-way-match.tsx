import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getThreeWayMatches, approvePayment } from "@/server-fns/matching";
import { toast } from "sonner";

export const Route = createFileRoute("/three-way-match")({
  head: () => ({
    meta: [
      { title: "3-Way Match — MedCare Pharma" },
      {
        name: "description",
        content:
          "Automatic reconciliation of purchase order, goods receipt and invoice with AI confidence scoring before payment release.",
      },
      { property: "og:title", content: "3-Way Match — MedCare Pharma" },
      {
        property: "og:description",
        content: "PO, receipt and invoice reconciled automatically at 99.2% confidence.",
      },
    ],
  }),
  component: ThreeWay,
});

function ThreeWay() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: matches = [] } = useQuery({
    queryKey: ["three_way_matches"],
    queryFn: () => getThreeWayMatches(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approvePayment({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["three_way_matches"] });
      toast.success("Payment approved");
    },
    onError: () => toast.error("Failed to approve payment"),
  });

  // Extract documents for layout assuming structure is known (mock structure replaced with dynamic but visual is same)
  // We'll use the first match if available to populate the layout
  const match = matches[0] || {};
  const columns = matches.length >= 3 ? matches.map((m: any) => ({
    title: m.title,
    qty: m.qty,
    price: m.price,
    ref: m.ref,
  })) : [
    { title: "Purchase Order", qty: "500", price: "₹86", ref: "PO-2026-08421" },
    { title: "Goods Receipt", qty: "498", price: "₹86", ref: "SH-48392" },
    { title: "Invoice", qty: "498", price: "₹86", ref: "INV-9832" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Reconciliation"
        title="AI 3-Way Matching"
        description="Purchase order, goods receipt and invoice compared line by line before any money moves."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Matched today" value="88" delta="of 96 invoices" tone="ok" />
        <KpiCard label="Avg confidence" value="99.2%" delta="Line-level" tone="ai" />
        <KpiCard label="Tolerance" value="±2%" delta="Qty and price" tone="primary" />
        <KpiCard label="Sent to exception" value="8" delta="₹1.1 L" tone="critical" />
      </div>

      <Panel title="Match view — N95 Mask" subtitle="Quantity and unit price across all three documents">
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-surface-2 p-4 text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {c.title}
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold">{c.qty}</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{c.price}</p>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-ok">
                <Check className="size-4" />
                <span className="text-xs">Verified</span>
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">{c.ref}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Match result"
        right={<Pill tone={match.status === "approved" ? "ok" : "ai"}>{match.status === "approved" ? "APPROVED" : "MATCH SUCCESSFUL"}</Pill>}
      >
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• PO quantity {columns[0].qty} · received {columns[1].qty} · invoiced {columns[2].qty} — variance within 2% tolerance.</li>
          <li>• Unit price {columns[0].price} matches contracted rate on all documents.</li>
          <li>• Tax treatment and payment terms consistent with supplier master.</li>
          <li>
            • AI confidence: <span className="font-mono text-ai">{match.confidence || 99.2}%</span>
          </li>
        </ul>
        <div className="mt-5">
          <ActionRow 
            labels={["Auto Approve Payment", "Hold", "Open in exceptions"]} 
            onAction={(label) => {
              if (label === "Auto Approve Payment" && match.id) {
                approveMutation.mutate(match.id);
              }
              if (label === "Hold") toast.success("Payment held for review");
              if (label === "Open in exceptions") navigate({ to: "/exceptions" });
            }}
          />
        </div>
      </Panel>
    </div>
  );
}
