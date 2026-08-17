import { createFileRoute } from "@tanstack/react-router";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, acknowledgeAlert, escalateAlert, executeRecommendation } from "@/server-fns/alerts";
import { toast } from "sonner";
import { type Alert } from "@/lib/types";
import { ArrowDown } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts & Escalations — MedCare Pharma Control Tower" },
      {
        name: "description",
        content:
          "Tiered escalation of supply-chain alerts with cause, impact, AI recommendation, owner and deadline for every incident.",
      },
      { property: "og:title", content: "Alerts & Escalations — MedCare Pharma" },
      {
        property: "og:description",
        content: "Planner to manager to supply chain head — escalation with full context.",
      },
    ],
  }),
  component: Alerts,
});

const ladder = [
  "AI detects shortage",
  "Level 1 — Planner",
  "Level 2 — Manager",
  "Level 3 — Supply Chain Head",
];

const toneFor = (s: string) => (s === "critical" ? "critical" : s === "high" ? "warn" : "ai");

function Alerts() {
  const queryClient = useQueryClient();
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => getAlerts() });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => acknowledgeAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alertsCount"] });
      toast.success("Alert acknowledged");
    },
    onError: (e) => toast.error(`Error: ${e.message}`)
  });

  const escalateMutation = useMutation({
    mutationFn: (id: number) => escalateAlert({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alertsCount"] });
      toast.success("Alert escalated");
    },
    onError: (e) => toast.error(`Error: ${e.message}`)
  });

  const executeMutation = useMutation({
    mutationFn: (id: number) => executeRecommendation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alertsCount"] });
      toast.success("Recommendation executed");
    },
    onError: (e) => toast.error(`Error: ${e.message}`)
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 · Control Tower"
        title="Alerts & Escalations"
        description="Every alert carries its cause, business impact, AI recommendation, accountable owner and deadline."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Critical" value={alerts.filter((a: Alert) => a.status === 'open' && a.severity === 'critical').length.toString()} delta="Next 72 hours" tone="critical" />
        <KpiCard label="High" value={alerts.filter((a: Alert) => a.status === 'open' && a.severity === 'high').length.toString()} delta="Expiry exposure" tone="warn" />
        <KpiCard label="Medium" value={alerts.filter((a: Alert) => a.status === 'open' && a.severity === 'medium').length.toString()} delta="Forecast drift" tone="ai" />
        <KpiCard label="Avg resolution" value="4.2 h" delta="-38% with AI" tone="ok" />
      </div>

      <Panel title="Escalation ladder" subtitle="Auto-escalates when SLA lapses">
        <div className="flex flex-col items-center gap-2">
          {ladder.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <span className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs">
                {step}
              </span>
              {i < ladder.length - 1 ? (
                <ArrowDown className="size-4 text-muted-foreground" />
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        {alerts.filter((a: Alert) => a.status === "open").map((a: Alert) => (
          <Panel
            key={a.id}
            title={a.title}
            right={<Pill tone={toneFor(a.severity)}>{a.severity.toUpperCase()}</Pill>}
          >
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Cause" value={a.cause} />
              <Field label="Impact" value={a.impact} />
              <Field label="AI recommendation" value={a.recommendation} />
              <Field label={`Owner · due ${a.deadline}`} value={a.owner} />
            </dl>
            <div className="mt-4">
              <ActionRow 
                disabled={
                  (executeMutation.isPending && executeMutation.variables === a.id) ||
                  (escalateMutation.isPending && escalateMutation.variables === a.id) ||
                  (acknowledgeMutation.isPending && acknowledgeMutation.variables === a.id)
                }
                actions={[
                  {
                    label: (executeMutation.isPending && executeMutation.variables === a.id) ? "Executing..." : "Execute recommendation",
                    onClick: () => executeMutation.mutate(a.id)
                  },
                  {
                    label: (escalateMutation.isPending && escalateMutation.variables === a.id) ? "Escalating..." : "Escalate",
                    onClick: () => escalateMutation.mutate(a.id)
                  },
                  {
                    label: (acknowledgeMutation.isPending && acknowledgeMutation.variables === a.id) ? "Acknowledging..." : "Acknowledge",
                    onClick: () => acknowledgeMutation.mutate(a.id)
                  }
                ]}
              />
            </div>
          </Panel>
        ))}

        {alerts.filter((a: Alert) => a.status !== "open").length > 0 && (
          <div className="pt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Processed Alerts</h3>
            <div className="space-y-4 opacity-60">
              {alerts.filter((a: Alert) => a.status !== "open").map((a: Alert) => (
                <Panel
                  key={a.id}
                  title={a.title}
                  right={<Pill tone="muted">{a.status.toUpperCase()}</Pill>}
                >
                  <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Field label="Cause" value={a.cause} />
                    <Field label="Impact" value={a.impact} />
                    <Field label="AI recommendation" value={a.recommendation} />
                    <Field label={`Owner`} value={a.owner} />
                  </dl>
                </Panel>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
