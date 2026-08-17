import { createFileRoute } from "@tanstack/react-router";
import { AiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, selectSupplier } from "@/server-fns/p2p";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/sourcing")({
  head: () => ({
    meta: [
      { title: "Smart Sourcing — MedCare Pharma" },
      {
        name: "description",
        content:
          "Multi-criteria supplier scoring on price, quality, lead time and reliability with a transparent AI recommendation.",
      },
      { property: "og:title", content: "Smart Sourcing — MedCare Pharma" },
      {
        property: "og:description",
        content: "AI-scored supplier selection with the reasoning shown.",
      },
    ],
  }),
  component: Sourcing,
});

function Sourcing() {
  const queryClient = useQueryClient();
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers(),
  });

  const selectMutation = useMutation({
    mutationFn: (id: number) => selectSupplier({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier selected successfully");
    },
    onError: () => toast.error("Failed to select supplier"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · AI Sourcing"
        title="Smart Sourcing"
        description="Requisition REQ-2026-1184 · N95 Masks × 500 · required 10 Sep 2026."
      />

      <Panel title="Supplier comparison" subtitle="Weighted: price 30% · quality 25% · lead time 25% · reliability 20%">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quality</TableHead>
                <TableHead className="text-right">Lead time</TableHead>
                <TableHead className="text-right">Reliability</TableHead>
                <TableHead className="text-right">AI score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right font-mono">{s.price}</TableCell>
                  <TableCell className="text-right font-mono">{s.quality}%</TableCell>
                  <TableCell className="text-right font-mono">{s.leadTime}</TableCell>
                  <TableCell className="text-right font-mono">{s.reliability}%</TableCell>
                  <TableCell className="text-right">
                    <Pill tone={s.score >= 94 ? "ok" : "warn"}>⭐ {s.score}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <AiCard
        title="AI decision — Recommended supplier: Supplier C"
        actions={[
          { label: "Auto-Select Supplier", onClick: () => {
            const recommended = suppliers.find((s: any) => s.name === "Supplier C") || suppliers[2] || suppliers[0];
            if (recommended) selectMutation.mutate(recommended.id);
          }},
          { label: "Override", variant: "outline", onClick: () => toast.success("Override mode activated — select a different supplier from the table") },
          { label: "Request quotes", variant: "outline", onClick: () => toast.success("RFQ sent to all qualified suppliers") },
        ]}
      >
        <ul className="space-y-1">
          <li>• Highest reliability at 99% across 214 historical orders.</li>
          <li>• Fastest delivery — 3 days against a hard 10 Sep deadline.</li>
          <li>• Best quality score (98%) with zero rejections in the last 6 months.</li>
          <li>• Slightly higher cost (+₹2,000) justified by urgency and stock-out exposure.</li>
        </ul>
      </AiCard>
    </div>
  );
}
