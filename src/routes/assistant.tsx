import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bot, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChatMessages, sendChatMessage, createRequisition } from "@/server-fns/assistant";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Procurement Assistant — MedCare Pharma" },
      {
        name: "description",
        content:
          "Conversational procurement: describe a requirement in plain language and the AI drafts the requisition, costs it and recommends a supplier.",
      },
      { property: "og:title", content: "AI Procurement Assistant — MedCare Pharma" },
      {
        property: "og:description",
        content: "Natural-language requisitions with instant supplier options and costing.",
      },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["chat_messages"],
    queryFn: () => getChatMessages(),
  });

  const chatMutation = useMutation({
    mutationFn: (text: string) => sendChatMessage({ data: { text } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat_messages"] }),
    onError: () => toast.error("Failed to send message"),
  });

  const reqMutation = useMutation({
    mutationFn: () => createRequisition(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
      if (data && data.success) {
         toast.success(`Requisition created! Generated ${data.poNumber} (${data.status})`);
      } else {
         toast.success("Requisition created");
      }
    },
    onError: () => toast.error("Failed to create requisition"),
  });

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    chatMutation.mutate(text);
  };

  const renderContent = (m: any) => {
    const textContent = m.content || m.text || "";
    if (m.role === "user") return textContent;
    
    try {
      const parsed = JSON.parse(textContent);
      if (parsed.text || parsed.message) {
        const msgText = parsed.text || parsed.message;
        const req = parsed.requirement;
        const sups = parsed.suppliers || parsed.suggestedSuppliers;
        const rec = parsed.recommendation;
        
        return (
          <div className="space-y-3">
            <p>{msgText}</p>
            {req && (
              <div className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
                <p>
                  <b>{req.item}</b> — {req.qty} units
                </p>
                <p className="mt-1 text-muted-foreground">
                  Facility: {req.facility} {req.deadline ? `· By: ${req.deadline}` : ''}
                </p>
                {req.estimatedCost && <p className="mt-1">Estimated cost: {req.estimatedCost}</p>}
              </div>
            )}
            {sups && sups.length > 0 && (
              <>
                <p>Supplier options:</p>
                <ul className="space-y-1 font-mono text-xs text-muted-foreground">
                  {sups.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{s.name}</span>
                      <span>{s.price} · {s.delivery || s.leadTime}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {rec && (
              <div className="mt-2 text-ai font-medium">
                {rec}
              </div>
            )}
          </div>
        );
      }
    } catch (e) {
      // Not JSON
    }
    return textContent;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PR2 · Conversational Procurement"
        title="AI Procurement Assistant"
        description="Anyone in the organisation can raise a compliant requisition just by describing what they need."
      />

      <Panel
        title="Conversation"
        right={<Pill tone="ai">NLP success rate 94%</Pill>}
        className="flex min-h-[520px] flex-col"
      >
        <div className="flex-1 space-y-4">
          {messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" ? (
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ai/20 text-ai">
                  <Bot className="size-4" />
                </div>
              ) : null}
              <div
                className={`max-w-[70%] rounded-xl border p-3 text-sm ${
                  m.role === "user"
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-surface-2"
                }`}
              >
                {renderContent(m)}
              </div>
              {m.role === "user" ? (
                <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <User className="size-4" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reqMutation.mutate()} disabled={reqMutation.isPending}>
            Create Requisition
          </Button>
          <Button variant="outline" onClick={() => toast.success("Sent to Smart Sourcing")}>
            Compare suppliers
          </Button>
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe what you need, e.g. 2,000 syringes for Chennai DC by 30 Aug"
            disabled={chatMutation.isPending}
          />
          <Button type="submit" disabled={chatMutation.isPending}>
            Send
          </Button>
        </form>
      </Panel>
    </div>
  );
}
