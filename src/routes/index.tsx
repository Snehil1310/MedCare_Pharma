import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AiCard, Bar, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { statusMeta, type Status } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { getExecutiveKpis } from "@/server-fns/kpis";
import { getDemandSeries } from "@/server-fns/demand";
import { getInventoryHealth } from "@/server-fns/inventory";
import { getAiRecommendations, executeRecommendation, dismissRecommendation } from "@/server-fns/kpis";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      { title: "Executive Dashboard — MedCare Pharma Supply Chain" },
      {
        name: "description",
        content:
          "Single view of inventory value, forecast accuracy, stock-out risk, expiry exposure and procure-to-pay automation across the MedCare network.",
      },
      { property: "og:title", content: "Executive Dashboard — MedCare Pharma Supply Chain" },
      {
        property: "og:description",
        content:
          "Live KPIs, AI demand forecast and autonomous procure-to-pay status for the MedCare healthcare supply chain.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();

  const { data: kpis = [] } = useQuery({
    queryKey: ["executive-kpis"],
    queryFn: () => getExecutiveKpis(),
  });

  const { data: demandSeries = [] } = useQuery({
    queryKey: ["demand-series"],
    queryFn: () => getDemandSeries(),
  });

  const { data: inventoryHealth } = useQuery({
    queryKey: ["inventory-health"],
    queryFn: () => getInventoryHealth(),
  });

  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: () => getAiRecommendations(),
  });

  const metro = inventoryHealth?.metro ?? [];
  const tier2 = inventoryHealth?.tier2 ?? [];

  const execMutation = useMutation({
    mutationFn: (id: number) => executeRecommendation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
      toast.success("Action executed successfully");
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => dismissRecommendation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
      toast.success("Recommendation dismissed");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive View"
        title="MedCare Pharma Supply Chain Control Tower"
        description="Demand sensing (P1) and autonomous procure-to-pay (PR2) operating as one connected decision system."
        actions={
          <Button asChild>
            <Link to="/command-center">Open AI Command Center</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k: any) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} tone={k.tone} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Demand forecast vs. sensed demand"
          subtitle="Actual demand, AI forecast, sensed signal and promotion impact"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={demandSeries}>
                <defs>
                  <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-ai)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-ai)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="AI Forecast"
                  stroke="var(--color-ai)"
                  fill="url(#fc)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual demand"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sensed"
                  name="Sensed demand"
                  stroke="var(--color-ok)"
                  strokeDasharray="5 4"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Inventory health map" subtitle="Distribution centre mix by network tier">
            <HealthBlock title="Metro DCs" rows={metro} />
            <div className="mt-5">
              <HealthBlock title="Tier-2 Cities" rows={tier2} />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {aiRecommendations.map((rec: any) => (
          <AiCard
            key={rec.id}
            tone={rec.tone}
            title={rec.title}
            actions={[
              { 
                label: rec.action, 
                onClick: () => execMutation.mutate(rec.id) 
              }, 
              { 
                label: "Dismiss", 
                variant: "outline", 
                onClick: () => dismissMutation.mutate(rec.id) 
              }
            ]}
          >
            <p>{rec.body}</p>
          </AiCard>
        ))}
      </div>
    </div>
  );
}

function HealthBlock({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; status: keyof typeof statusMeta }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <Pill
                tone={
                  r.status === "healthy"
                    ? "ok"
                    : r.status === "low" || r.status === "excess"
                      ? "warn"
                      : r.status === "expiry"
                        ? "ai"
                        : "critical"
                }
              >
                {r.label}
              </Pill>
              <span className="font-mono text-muted-foreground">{r.value}%</span>
            </div>
            <Bar
              value={r.value}
              tone={
                r.status === "healthy"
                  ? "ok"
                  : r.status === "low" || r.status === "excess"
                    ? "warn"
                    : r.status === "expiry"
                      ? "ai"
                      : "critical"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
