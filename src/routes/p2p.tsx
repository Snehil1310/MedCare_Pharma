import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, Panel, Pill, StageChip } from "@/components/ui-kit";
import { useQuery } from "@tanstack/react-query";
import { getP2PStages } from "@/server-fns/p2p";
import { type P2PStage } from "@/lib/types";

export const Route = createFileRoute("/p2p")({
  head: () => ({
    meta: [
      { title: "P2P Control Tower — MedCare Pharma" },
      {
        name: "description",
        content:
          "End-to-end status of the autonomous procure-to-pay pipeline from NLP requisition through sourcing, receipt, matching and payment.",
      },
      { property: "og:title", content: "P2P Control Tower — MedCare Pharma" },
      {
        property: "og:description",
        content: "Every procure-to-pay stage, automated or escalated, in one view.",
      },
    ],
  }),
  component: P2P,
});

function P2P() {
  const { data: p2pStages = [] } = useQuery({ queryKey: ["p2pStages"], queryFn: () => getP2PStages() });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Autonomous Procure-to-Pay"
        title="P2P Control Tower"
        description="Request to payment as a single autonomous pipeline, with humans pulled in only on exception."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Touchless POs" value="87%" delta="Target 90%" tone="ok" />
        <KpiCard label="Avg cycle time" value="18 min" delta="was 4.2 days" tone="primary" />
        <KpiCard label="Open exceptions" value="3" delta="₹1.1 L blocked" tone="critical" />
        <KpiCard label="Auto-paid value" value="₹13.1 L" delta="This cycle" tone="ai" />
      </div>

      <Panel
        title="Pipeline status"
        subtitle="Live stage health"
        right={
          <div className="flex gap-1.5">
            <Pill tone="ok">Automated</Pill>
            <Pill tone="warn">Requires review</Pill>
            <Pill tone="critical">Exception</Pill>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {p2pStages.map((s: P2PStage, i: number) => (
            <StageChip key={s.name} index={i} {...s} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Throughput today">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between">
              <span>Requisitions raised</span> <span className="font-mono text-foreground">128</span>
            </li>
            <li className="flex justify-between">
              <span>POs issued</span> <span className="font-mono text-foreground">41</span>
            </li>
            <li className="flex justify-between">
              <span>Invoices processed</span> <span className="font-mono text-foreground">96</span>
            </li>
            <li className="flex justify-between">
              <span>Payments released</span> <span className="font-mono text-foreground">78</span>
            </li>
          </ul>
        </Panel>
        <Panel title="Automation rules in force" className="lg:col-span-2">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Contracted supplier + value under ₹1 L → fully autonomous.</li>
            <li>• Price variance above 5% or new supplier → finance review.</li>
            <li>• CV-flagged damage or quantity gap → supplier action workflow.</li>
            <li>• Duplicate-invoice similarity above 90% → blocked and escalated.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
