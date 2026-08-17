import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceFields } from "@/server-fns/invoices";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoice OCR — MedCare Pharma" },
      {
        name: "description",
        content:
          "Intelligent OCR extraction of supplier invoices with field-level confidence and automatic hand-off to three-way matching.",
      },
      { property: "og:title", content: "Invoice OCR — MedCare Pharma" },
      {
        property: "og:description",
        content: "Invoice in, structured data out, matched without human keying.",
      },
    ],
  }),
  component: Invoices,
});

const pipeline = ["Invoice received", "Intelligent OCR", "Data extraction", "3-way matching"];

function Invoices() {
  const navigate = useNavigate();
  const { data: extracted = [] } = useQuery({
    queryKey: ["invoice_fields"],
    queryFn: () => getInvoiceFields(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Invoice Processing"
        title="Intelligent OCR"
        description="Invoices arrive by email, portal or EDI and are converted to structured, matchable data."
        actions={<div />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Invoices today" value="96" delta="82% auto-approved" tone="primary" />
        <KpiCard label="OCR accuracy" value="98.6%" delta="Field-level" tone="ai" />
        <KpiCard label="Processing time" value="22 min" delta="was 3.1 days" tone="ok" />
        <KpiCard label="Duplicates blocked" value="37" delta="₹9.6 L saved" tone="warn" />
      </div>

      <Panel title="Extraction pipeline">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          {pipeline.map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <span className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs">
                {p}
              </span>
              {i < pipeline.length - 1 ? (
                <ArrowDown className="size-4 rotate-0 text-muted-foreground sm:-rotate-90" />
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Extracted fields — INV-9832"
        right={<Pill tone="ai">Avg confidence 98.6%</Pill>}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {extracted.map((e: any) => (
            <div key={e.id || e.field_name} className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {e.field_name}
              </p>
              <p className="mt-1 text-sm">{e.field_value}</p>
              <p className="mt-1 font-mono text-[11px] text-ai">{e.confidence}% confidence</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <ActionRow 
            labels={["Send to 3-way match", "Correct field", "Flag exception"]} 
            onAction={(label) => {
              if (label === "Send to 3-way match") navigate({ to: "/three-way-match" });
              if (label === "Correct field") toast.success("Field correction mode activated");
              if (label === "Flag exception") toast.success("Exception flagged for review");
            }}
          />
        </div>
      </Panel>
    </div>
  );
}
