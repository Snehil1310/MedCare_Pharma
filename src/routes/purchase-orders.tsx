import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ActionRow, KpiCard, PageHeader, Panel, Pill } from "@/components/ui-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPurchaseOrders, approvePO, sendPOToSupplier, editPO } from "@/server-fns/purchase-orders";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({
    meta: [
      { title: "Purchase Orders — MedCare Pharma" },
      {
        name: "description",
        content:
          "AI-generated purchase orders with supplier, line items, terms and autonomous approval status.",
      },
      { property: "og:title", content: "Purchase Orders — MedCare Pharma" },
      {
        property: "og:description",
        content: "Sourcing decisions turned into issued POs without manual data entry.",
      },
    ],
  }),
  component: PurchaseOrders,
});

function PurchaseOrders() {
  const queryClient = useQueryClient();
  const [editingPO, setEditingPO] = useState<any>(null);
  const [editForm, setEditForm] = useState({ supplier: "", total: "", delivery: "", terms: "" });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase_orders"],
    queryFn: () => getPurchaseOrders(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approvePO({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      toast.success("PO approved successfully");
    },
    onError: (e) => toast.error(`Failed to approve PO: ${e.message}`),
  });

  const sendMutation = useMutation({
    mutationFn: (id: number) => sendPOToSupplier({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      toast.success("PO sent to supplier");
    },
    onError: (e) => toast.error(`Failed to send PO: ${e.message}`),
  });

  const editMutation = useMutation({
    mutationFn: (data: { id: number; supplier?: string; total?: string; delivery?: string; terms?: string }) =>
      editPO({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      toast.success("Purchase order updated");
      setEditingPO(null);
    },
    onError: (e) => toast.error(`Failed to edit PO: ${e.message}`),
  });

  const openEditDialog = (po: any) => {
    setEditingPO(po);
    setEditForm({
      supplier: po.supplier,
      total: po.total,
      delivery: po.delivery,
      terms: po.terms,
    });
  };

  const handleEditSubmit = () => {
    if (!editingPO) return;
    editMutation.mutate({
      id: editingPO.id,
      supplier: editForm.supplier,
      total: editForm.total,
      delivery: editForm.delivery,
      terms: editForm.terms,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Autonomous PO Generation"
        title="Purchase Orders"
        description="Once sourcing completes, the AI drafts, prices and issues the purchase order automatically."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="POs today" value="41" delta="36 touchless" tone="primary" />
        <KpiCard label="Auto-approved" value="88%" delta="Rule-based bypass" tone="ok" />
        <KpiCard label="Avg draft time" value="42 s" delta="was 3.5 hours" tone="ai" />
        <KpiCard label="Held for review" value="5" delta="New suppliers" tone="warn" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {purchaseOrders.map((po: any) => {
          let items = po.items;
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch (e) {
              items = [];
            }
          }
          
          const statusTone = po.status === "Approved" ? "ok" 
            : po.status === "Sent to Supplier" ? "primary" 
            : "ai";

          return (
            <Panel
              key={po.id}
              title={`Purchase Order ${po.number}`}
              subtitle={po.supplier}
              right={<Pill tone={statusTone}>{po.status}</Pill>}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items && items.map((it: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{it.item || it.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {(it.quantity || it.qty)?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-mono">{it.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="mt-1 font-mono text-base text-primary">{po.total}</dd>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="mt-1">{po.delivery}</dd>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <dt className="text-muted-foreground">Payment terms</dt>
                  <dd className="mt-1">{po.terms}</dd>
                </div>
              </dl>

              {(() => {
                let actionLabels: string[] = [];
                if (po.status === "Pending" || po.status === "AI Generated") {
                  actionLabels = ["Approve", "Edit", "Send to Supplier"];
                } else if (po.status === "Approved") {
                  actionLabels = ["Send to Supplier"];
                }

                if (actionLabels.length === 0) return null;

                return (
                  <div className="mt-4">
                    <ActionRow
                      labels={actionLabels}
                      onAction={(label) => {
                        if (label === "Approve") approveMutation.mutate(po.id);
                        else if (label === "Edit") openEditDialog(po);
                        else if (label === "Send to Supplier") sendMutation.mutate(po.id);
                      }}
                    />
                  </div>
                );
              })()}
            </Panel>
          );
        })}
      </div>

      {/* Edit PO Dialog */}
      <Dialog open={!!editingPO} onOpenChange={(open) => { if (!open) setEditingPO(null); }}>
        <DialogContent className="bg-[var(--color-surface)] border-border">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order {editingPO?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                value={editForm.supplier}
                onChange={(e) => setEditForm(f => ({ ...f, supplier: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-total">Total</Label>
              <Input
                id="edit-total"
                value={editForm.total}
                onChange={(e) => setEditForm(f => ({ ...f, total: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-delivery">Delivery Date</Label>
              <Input
                id="edit-delivery"
                value={editForm.delivery}
                onChange={(e) => setEditForm(f => ({ ...f, delivery: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-terms">Payment Terms</Label>
              <Input
                id="edit-terms"
                value={editForm.terms}
                onChange={(e) => setEditForm(f => ({ ...f, terms: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPO(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
