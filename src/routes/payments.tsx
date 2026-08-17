import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentSummary, getWeeklyPayments, getPendingPayments, approvePendingPayment, declinePendingPayment, generatePaymentReceipt } from "@/server-fns/payments";
import { toast } from "sonner";
import { ActionRow } from "@/components/ui-kit";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — MedCare Pharma" },
      {
        name: "description",
        content:
          "Autonomous payment release for matched invoices with full visibility of approved, pending, exception and auto-paid value.",
      },
      { property: "og:title", content: "Payments — MedCare Pharma" },
      {
        property: "og:description",
        content: "Matched invoices settle themselves and write back to the ERP.",
      },
    ],
  }),
  component: Payments,
});

const timeline = ["Invoice", "Match", "Approval", "Payment", "ERP update"];

function Payments() {
  const queryClient = useQueryClient();

  const { data: summaryData = [] } = useQuery({
    queryKey: ['paymentSummary'],
    queryFn: () => getPaymentSummary()
  });

  const { data: pendingPayments = [] } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: () => getPendingPayments()
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approvePendingPayment({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      toast.success("Payment approved successfully");
    }
  });

  const declineMutation = useMutation({
    mutationFn: (id: number) => declinePendingPayment({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      toast.error("Payment declined");
    }
  });

  const receiptMutation = useMutation({
    mutationFn: (id: number) => generatePaymentReceipt({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      toast.success("Receipt generated and sent to supplier");
    }
  });

  const { data: rawWeeklyData = [] } = useQuery({
    queryKey: ['weeklyPayments'],
    queryFn: () => getWeeklyPayments()
  });

  // Map database columns to the keys expected by the chart
  const weekly = rawWeeklyData.map((d: any) => ({
    week: d.week,
    auto: d.auto_amount ?? d.auto,
    manual: d.manual_amount ?? d.manual
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Autonomous Payment"
        title="Payments"
        description="Matched, in-tolerance invoices settle without human touch and post straight back to finance systems."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryData.length > 0 ? (
          summaryData.map((s: any) => (
            <KpiCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
          ))
        ) : (
          <>
            <KpiCard label="Approved invoices" value="₹18.4 L" tone="ok" />
            <KpiCard label="Pending payment" value="₹4.2 L" tone="warn" />
            <KpiCard label="Exceptions" value="₹1.1 L" tone="critical" />
            <KpiCard label="Auto-paid" value="₹13.1 L" tone="ai" />
          </>
        )}
      </div>

      <Panel title="Payment timeline" right={<Pill tone="ok">Straight-through 82%</Pill>}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {timeline.map((t, i) => (
            <div key={t} className="flex items-center gap-3">
              <span className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs">
                {t}
              </span>
              {i < timeline.length - 1 ? (
                <ArrowRight className="size-4 text-muted-foreground" />
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Auto-paid vs manual value" subtitle="₹ lakh per week">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="auto" name="Auto-paid" fill="var(--color-ok)" radius={[6, 6, 0, 0]} />
              <Bar
                dataKey="manual"
                name="Manual"
                fill="var(--color-muted-foreground)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Pending Payments" subtitle="Invoices requiring manual review or payment authorization">
        {pendingPayments.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No pending payments. All clear!
          </div>
        ) : (
          <div className="space-y-1">
            {pendingPayments.map((p: any) => (
              <ActionRow
                key={p.id}
                title={`Invoice ${p.invoice_number} — ${p.supplier}`}
                subtitle={`Amount: ${p.amount} · Due: ${p.due_date}`}
                status="pending"
                actions={[
                  { label: "Approve", onClick: () => approveMutation.mutate(p.id) },
                  { label: "Decline", variant: "outline", onClick: () => declineMutation.mutate(p.id) },
                  { label: "Generate Receipt", variant: "outline", onClick: () => receiptMutation.mutate(p.id) }
                ]}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
