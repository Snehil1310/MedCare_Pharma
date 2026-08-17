import { createFileRoute } from "@tanstack/react-router";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExceptions, resolveException } from "@/server-fns/exceptions";
import { toast } from "sonner";

export const Route = createFileRoute("/exceptions")({
  head: () => ({
    meta: [
      { title: "Exceptions — MedCare Pharma" },
      {
        name: "description",
        content:
          "Human-in-the-loop review queue for price variances, quantity mismatches and suspected duplicate invoices.",
      },
      { property: "og:title", content: "Exceptions — MedCare Pharma" },
      {
        property: "og:description",
        content: "The only place humans are needed — everything else runs autonomously.",
      },
    ],
  }),
  component: Exceptions,
});

const tone = (s: string) => (s === "critical" ? "critical" : s === "high" ? "warn" : "ai");

function Exceptions() {
  const queryClient = useQueryClient();
  const { data: exceptions = [] } = useQuery({
    queryKey: ["exceptions"],
    queryFn: () => getExceptions(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => resolveException({ data: { id, action } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exceptions"] });
      toast.success("Exception resolved");
    },
    onError: () => toast.error("Failed to resolve exception"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Exception Management"
        title="Exceptions"
        description="Not everything should be auto-approved. These are the cases the AI deliberately escalated."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open exceptions" value="3" delta="₹1.1 L blocked" tone="critical" />
        <KpiCard label="Exception rate" value="5.8%" delta="-3.4 pts YoY" tone="ok" />
        <KpiCard label="Avg resolution" value="3.6 h" delta="SLA 8 h" tone="primary" />
        <KpiCard label="Recovered value" value="₹9.6 L" delta="Duplicates + variances" tone="ai" />
      </div>

      <div className="space-y-4">
        {exceptions.map((e: any) => {
          let statusTone = tone(e.severity);
          let statusLabel = e.severity.toUpperCase();

          if (e.status !== "open") {
            statusLabel = e.status === "Investigating" ? "UNDER INVESTIGATION" : e.status.toUpperCase();
            if (e.status === "Investigating" || e.status === "Contacting Supplier") statusTone = "warn";
            else if (e.status === "Rejected") statusTone = "critical";
            else if (e.status === "Approved") statusTone = "ok";
          }

          let labels: string[] = [];
          if (e.status === "open") {
            labels = ["Investigate", "Contact Supplier", "Approve Override", "Reject"];
          } else if (e.status === "Investigating" || e.status === "Contacting Supplier") {
            labels = ["Approve Override", "Reject"];
          }

          return (
            <Panel
              key={e.id}
              title={`${e.exception_id || e.id} — ${e.title}`}
              subtitle={e.reason}
              right={<Pill tone={statusTone}>{statusLabel}</Pill>}
            >
            {labels.length > 0 && (
              <ActionRow
                labels={labels}
                onAction={(label) => {
                  const actionMap: Record<string, string> = {
                    "Investigate": "Investigating",
                    "Contact Supplier": "Contacting Supplier",
                    "Approve Override": "Approved",
                    "Reject": "Rejected",
                  };
                  resolveMutation.mutate({ id: e.id, action: actionMap[label] });
                }}
              />
            )}
          </Panel>
        )})}
      </div>
    </div>
  );
}
