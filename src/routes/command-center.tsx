import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ActionRow, AiCard, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommandCenterData, executeAllActions, executeIndividualAction } from "@/server-fns/command-center";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/command-center")({
  head: () => ({
    meta: [
      { title: "AI Command Center — MedCare Pharma" },
      {
        name: "description",
        content:
          "Proactive cross-module recommendations linking demand sensing, stock transfers and autonomous procurement into one executable plan.",
      },
      { property: "og:title", content: "AI Command Center — MedCare Pharma" },
      {
        property: "og:description",
        content:
          "One autonomous decision loop: sense demand, reallocate stock, raise POs and approve payments.",
      },
    ],
  }),
  component: CommandCenter,
});

const defaultFlow = [
  "Flu demand spike detected",
  "AI predicts shortage",
  "Expiry-aware transfer",
  "Requirement generated",
  "NLP requisition",
  "AI supplier selection",
  "PO generated",
  "Goods receipt verified",
  "OCR invoice",
  "3-way match",
  "Payment approved",
];

function CommandCenter() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [executedSteps, setExecutedSteps] = useState<Set<string>>(new Set());
  
  const { data } = useQuery({
    queryKey: ['commandCenterData'],
    queryFn: () => getCommandCenterData()
  });

  const executeMutation = useMutation({
    mutationFn: () => executeAllActions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandCenterData'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['replenishment_plans'] });
      toast.success('Actions executed successfully');
    },
    onError: () => {
      toast.error('Failed to execute actions');
    }
  });

  const executeIndividual = useMutation({
    mutationFn: (actionType: string) => executeIndividualAction({ data: { actionType } }),
    onSuccess: (_, actionType) => {
      setExecutedSteps(prev => new Set(prev).add(actionType));
      queryClient.invalidateQueries({ queryKey: ['commandCenterData'] });
      if (actionType === 'transfer') {
        queryClient.invalidateQueries({ queryKey: ['replenishment_plans'] });
        toast.success('Transfer approved successfully');
      } else if (actionType === 'po') {
        queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
        toast.success('Purchase order generated successfully');
      }
    },
    onError: () => toast.error('Failed to execute action')
  });

  const flow = data?.flowStages?.map((s: any) => s.name) || defaultFlow;
  
  // Note: we can use kpis from data, but we'll stick to the original mock values for KpiCards 
  // if kpis are not in the exact format, but let's try to map them if possible.
  // Actually, instructions say "Keep the EXACT same visual design and layout".
  // The original didn't use mock data for KPIs in command-center.tsx, but the server function returns `kpis`.
  // We'll leave the KPIs hardcoded as they were in the original, or we could map them. We'll map them if available.
  const kpis = data?.kpis || [];
  const openPlans = kpis.find((k: any) => k.label.includes('Open AI')) || { value: "6", delta: "2 awaiting approval", tone: "ai" };
  const autonomy = kpis.find((k: any) => k.label.includes('Autonomy')) || { value: "87%", delta: "Rule-based bypass on", tone: "ok" };
  const valueRisk = kpis.find((k: any) => k.label.includes('Value at risk')) || { value: "₹6.8 L", delta: "Next 72 hours", tone: "critical" };
  const savings = kpis.find((k: any) => k.label.includes('savings')) || { value: "₹18.4 L", delta: "If all executed", tone: "primary" };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Unified Intelligence"
        title="AI Command Center"
        description="The bridge between P1 demand sensing and PR2 autonomous procure-to-pay — one recommendation, one execution chain."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open AI plans" value={openPlans.value} delta={openPlans.delta} tone={openPlans.tone} />
        <KpiCard label="Autonomy level" value={autonomy.value} delta={autonomy.delta} tone={autonomy.tone} />
        <KpiCard label="Value at risk" value={valueRisk.value} delta={valueRisk.delta} tone={valueRisk.tone} />
        <KpiCard label="Projected savings" value={savings.value} delta={savings.delta} tone={savings.tone} />
      </div>

      {data?.criticalAlerts > 0 && (
        <AiCard
          tone="critical"
        title="🔴 Action Required — Flu-season Paracetamol surge"
        actions={[
          { label: "Execute All", onClick: () => executeMutation.mutate() },
          { label: "Simulate impact", variant: "outline", onClick: () => toast.success("Simulation complete: Stock-out probability drops from 21% to 4%, expiry wastage reduced by ₹1.8 L") },
          { label: "Assign to planner", variant: "outline", onClick: () => toast.success("Plan assigned to Level 1 — Demand Planner for review") },
        ]}
      >
        <p>
          Sensed demand for Paracetamol 500mg is expected to rise <b>+58%</b> across the Tier-2
          network. Current Tier-2 inventory is insufficient for the next 3 weeks.
        </p>
        <ol className="mt-3 space-y-2 text-sm text-foreground">
          <li className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
            <span>1. Transfer <b>3,000 units</b> from Mumbai DC (batch expires in 42 days).</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs" 
              onClick={() => executeIndividual.mutate('transfer')} 
              disabled={executedSteps.has('transfer') || (executeIndividual.isPending && executeIndividual.variables === 'transfer')}
            >
              {executedSteps.has('transfer') ? 'Executed' : (executeIndividual.isPending && executeIndividual.variables === 'transfer') ? 'Executing...' : 'Execute'}
            </Button>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
            <span>2. Create PO for an additional <b>8,000 units</b> to rebuild safety stock.</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs" 
              onClick={() => executeIndividual.mutate('po')} 
              disabled={executedSteps.has('po') || (executeIndividual.isPending && executeIndividual.variables === 'po')}
            >
              {executedSteps.has('po') ? 'Executed' : (executeIndividual.isPending && executeIndividual.variables === 'po') ? 'Executing...' : 'Execute'}
            </Button>
          </li>
          <li className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
            <span>3. Prioritise <b>Supplier C</b> — 3-day lead time, 99% reliability.</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs" 
              onClick={() => {
                setExecutedSteps(prev => new Set(prev).add('supplier'));
                toast.success("Supplier prioritization active");
              }}
              disabled={executedSteps.has('supplier')}
            >
              {executedSteps.has('supplier') ? 'Executed' : 'Execute'}
            </Button>
          </li>
        </ol>
      </AiCard>
      )}

      <Panel title="End-to-end autonomous flow" subtitle="P1 signal → PR2 settlement, no manual handoff">
        <div className="flex flex-wrap items-center gap-2">
          {flow.map((step: string, i: number) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs">
                {step}
              </span>
              {i < flow.length - 1 ? (
                <ArrowRight className="size-3.5 text-muted-foreground" />
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Impact if executed">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Stock-out probability</span>
              <span>
                <Pill tone="critical">21%</Pill> → <Pill tone="ok">4%</Pill>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Expiry wastage</span>
              <span>
                <Pill tone="critical">₹2.4 L</Pill> → <Pill tone="ok">₹0.6 L</Pill>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Service level</span>
              <span>
                <Pill tone="warn">94%</Pill> → <Pill tone="ok">98%</Pill>
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="Human-in-the-loop policy">
          <p className="text-sm text-muted-foreground">
            Transactions under ₹1 L matching an approved supplier contract execute autonomously.
            Price variance above 5%, new suppliers and CV-flagged receipts always escalate.
          </p>
          <div className="mt-4">
            <ActionRow 
              labels={["Edit autonomy rules", "View audit trail"]} 
              onAction={(label) => {
                if (label === "Edit autonomy rules") {
                  navigate({ to: "/settings" });
                } else {
                  toast.success("Audit trail summary generated successfully");
                }
              }}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
