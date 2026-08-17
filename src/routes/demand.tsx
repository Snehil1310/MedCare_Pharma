import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AiCard, Bar, KpiCard, PageHeader, Panel } from "@/components/ui-kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { getDemandSeries, getDemandDrivers } from '@/server-fns/demand';
import { toast } from "sonner";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Demand Intelligence — MedCare Pharma" },
      {
        name: "description",
        content:
          "Explainable AI demand sensing with historical, sensed and forecast demand plus the drivers behind every prediction.",
      },
      { property: "og:title", content: "Demand Intelligence — MedCare Pharma" },
      {
        property: "og:description",
        content: "See why demand is changing, not just what the model predicts.",
      },
    ],
  }),
  component: Demand,
});

const filters = [
  { label: "Region", options: ["All regions", "Metro", "Tier-2", "South", "West"] },
  { label: "SKU", options: ["Paracetamol 500mg", "Amoxicillin 500mg", "N95 Mask"] },
  { label: "Category", options: ["All categories", "Antibiotics", "Analgesics", "PPE"] },
  { label: "Time Period", options: ["Next 8 weeks", "Next quarter", "Next 6 months"] },
];

function Demand() {
  const navigate = useNavigate();
  
  const [region, setRegion] = useState(filters[0].options[0]);
  const [sku, setSku] = useState(filters[1].options[0]);
  const [category, setCategory] = useState(filters[2].options[0]);
  const [timePeriod, setTimePeriod] = useState(filters[3].options[0]);

  const { data: demandSeries = [] } = useQuery({ queryKey: ['demandSeries'], queryFn: () => getDemandSeries() });
  const { data: baseDrivers = [] } = useQuery({ queryKey: ['demandDrivers'], queryFn: () => getDemandDrivers() });

  // Generate dynamic drivers based on Category and SKU so they change visibly
  const dynamicDrivers = useMemo(() => {
    return baseDrivers.map((d: any, index: number) => {
      let newLabel = d.label;
      if (index === 0) {
        newLabel = category === "Antibiotics" ? "Prescription surge" : 
                   category === "PPE" ? "Hospital protocol update" : 
                   sku.includes("N95") ? "Air quality drop" : d.label;
      } else if (index === 1) {
        newLabel = region === "South" ? "Monsoon outbreak" : 
                   region === "Metro" ? "Urban density spike" : d.label;
      }
      // Different multiplier per driver to change their relative proportions visually
      const variation = ((sku.length * (index + 1)) % 5) * 0.25 - ((category.length * index) % 3) * 0.15 + (region === "South" ? index * 0.1 : 0);
      const newImpact = Math.round(d.impact * (1 + variation));
      return { ...d, label: newLabel, impact: newImpact > 0 ? newImpact : 5 };
    });
  }, [baseDrivers, category, region, sku]);

  const total = dynamicDrivers.reduce((s: number, d: any) => s + d.impact, 0);
  const maxImpact = Math.max(...dynamicDrivers.map((d: any) => d.impact));
  const uplift = Math.round(total * 0.85);
  const accuracy = (91.4 + (sku.length % 5) * 0.3 + (region === "Metro" ? 2.1 : 0)).toFixed(1);

  // Generate dynamic data based on filters so the chart updates
  const dynamicSeries = useMemo(() => {
    // Determine how many months to show based on timePeriod
    let limit = 9;
    if (timePeriod.includes("8 weeks")) limit = 2;
    else if (timePeriod.includes("quarter")) limit = 3;
    else if (timePeriod.includes("6 months")) limit = 6;
    
    const baseMult = 1 + (sku.length % 5) * 0.3 + (region === "All regions" ? 0 : 0.8);
    const sliced = demandSeries.slice(demandSeries.length - limit);
    
    return sliced.map((d: any, i: number) => {
      // Force the line chart curve to progressively match the exact `uplift` percentage
      const progress = i / Math.max(1, sliced.length - 1);
      const trendMult = 1 + (uplift / 100) * progress;
      const m = baseMult * trendMult;
      
      return {
        month: d.month,
        actual: d.actual ? Math.round(d.actual * m) : null,
        sensed: d.sensed ? Math.round(d.sensed * m) : null,
        // AI forecast diverges slightly higher at the end to show the wedge
        forecast: d.forecast ? Math.round(d.forecast * m * (1 + 0.05 * progress)) : null,
      };
    });
  }, [demandSeries, sku, region, timePeriod, uplift]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 · Demand Sensing"
        title="Demand Intelligence"
        description="Signal-driven forecasting across regions, SKUs and categories with transparent driver attribution."
      />

      <Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filters.map((f) => (
            <div key={f.label}>
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </p>
              <Select 
                value={
                  f.label === "Region" ? region 
                  : f.label === "SKU" ? sku 
                  : f.label === "Category" ? category 
                  : timePeriod
                } 
                onValueChange={(val) => {
                  if (f.label === "Region") setRegion(val);
                  else if (f.label === "SKU") setSku(val);
                  else if (f.label === "Category") setCategory(val);
                  else if (f.label === "Time Period") setTimePeriod(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Forecast accuracy" value={`${accuracy}%`} delta={`MAPE ${(100 - parseFloat(accuracy)).toFixed(1)}%`} tone="ok" />
        <KpiCard label="Sensed uplift" value={`+${uplift}%`} delta={`Next 30 days`} tone="critical" />
        <KpiCard label="Signals ingested" value="14" delta="Weather, POS, epidemiology" tone="ai" />
        <KpiCard label="SKUs re-forecast" value="312" delta="Last 24 hours" tone="primary" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Historical vs sensed vs AI forecast"
          subtitle={`Units per month · ${sku} · ${region === 'All regions' ? 'Global' : region} network`}
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicSeries}>
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
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical demand"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sensed"
                  name="Sensed demand"
                  stroke="var(--color-ok)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="AI forecast"
                  stroke="var(--color-ai)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Demand signals" subtitle="Why the forecast is moving">
          <div className="space-y-4">
            {dynamicDrivers.map((d: any) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>
                    <span className="mr-1.5">{d.icon}</span>
                    {d.label}
                  </span>
                  <span className="font-mono text-ok">+{d.impact}%</span>
                </div>
                <Bar value={(d.impact / maxImpact) * 100} tone="ai" />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-critical/30 bg-critical/10 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Expected demand increase
            </p>
            <p className="mt-1 text-3xl font-semibold text-critical">+{uplift}%</p>
          </div>
        </Panel>
      </div>

      <AiCard
        title="Forecast explanation"
        actions={[
          { label: "Push to replenishment", onClick: () => { navigate({ to: '/replenishment' }); toast.success('Forecast pushed to replenishment engine'); } },
          { label: "Export", variant: "outline", onClick: () => toast.success('Demand forecast exported as CSV') }
        ]}
      >
        <p>
          The +{uplift}% uplift is dominated by {dynamicDrivers[0]?.label.toLowerCase()} (+{dynamicDrivers[0]?.impact}%) confirmed by regional
          case reporting, compounded by {dynamicDrivers[1]?.label.toLowerCase()} (+{dynamicDrivers[1]?.impact}%) and continued network
          growth. Confidence interval ±6.2% at 30 days.
        </p>
      </AiCard>
    </div>
  );
}
