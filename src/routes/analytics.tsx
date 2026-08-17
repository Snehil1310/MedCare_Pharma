import { createFileRoute } from "@tanstack/react-router";
import { Bar, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsMetrics } from "@/server-fns/analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MedCare Pharma" },
      {
        name: "description",
        content:
          "Procurement, automation and finance performance metrics showing the measurable impact of AI on the MedCare supply chain.",
      },
      { property: "og:title", content: "Analytics — MedCare Pharma" },
      {
        property: "og:description",
        content: "Cycle time, touchless rate, OCR accuracy and savings in one scorecard.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data: metrics } = useQuery({
    queryKey: ['analyticsMetrics'],
    queryFn: () => getAnalyticsMetrics()
  });

  const procurement = metrics?.procurement || [];
  const finance = metrics?.finance || [];
  const automation = metrics?.automation || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insight"
        title="Supply Chain & P2P Analytics"
        description="The proof layer: what automation changed across procurement, operations and finance."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Procurement">
          <div className="grid gap-3 sm:grid-cols-2">
            {procurement.map((m: any) => (
              <div key={m.label} className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 font-mono text-lg text-primary">{m.value}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Finance">
          <div className="grid gap-3 sm:grid-cols-2">
            {finance.map((m: any) => (
              <div key={m.label} className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 font-mono text-lg text-ok">{m.value}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="AI performance" right={<Pill tone="ai">Model health nominal</Pill>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {automation.map((m: any) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-mono text-ai">{m.value}</span>
              </div>
              <Bar value={parseFloat(m.value)} tone="ai" />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="P2P automation split">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Manual processing</span>
                <span className="font-mono">13%</span>
              </div>
              <Bar value={13} tone="muted" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">AI automated</span>
                <span className="font-mono text-ok">87%</span>
              </div>
              <Bar value={87} tone="ok" />
            </div>
          </div>
        </Panel>

        <Panel title="Average processing time">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-critical/30 bg-critical/10 p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Before AI</p>
              <p className="mt-1 font-mono text-2xl text-critical">4.2 days</p>
            </div>
            <div className="rounded-xl border border-ok/30 bg-ok/10 p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">After AI</p>
              <p className="mt-1 font-mono text-2xl text-ok">18 minutes</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            336× faster cycle time on contracted, in-tolerance transactions.
          </p>
        </Panel>
      </div>
    </div>
  );
}
