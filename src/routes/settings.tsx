import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateToggle, updateThreshold } from "@/server-fns/settings";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MedCare Pharma" },
      {
        name: "description",
        content:
          "Role-based access, autonomy thresholds and escalation policy configuration for the MedCare Pharma supply chain platform.",
      },
      { property: "og:title", content: "Settings — MedCare Pharma" },
      {
        property: "og:description",
        content: "Control who sees what and how far the AI is allowed to act alone.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettings()
  });

  const toggleMutation = useMutation({
    mutationFn: (data: { id: number; enabled: boolean }) => updateToggle({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Setting updated");
    },
    onError: () => toast.error("Failed to update setting"),
  });

  const thresholdMutation = useMutation({
    mutationFn: (data: { id: number; value: number }) => updateThreshold({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Threshold updated");
    },
    onError: () => toast.error("Failed to update threshold"),
  });

  const roles = data?.roles || [];
  const toggles = data?.toggles || [];
  const thresholds = data?.thresholds || [];

  const getLabelText = (labelStr: string, value: number) => {
    if (labelStr.includes("Auto-approval limit")) {
      return `Auto-approval limit — ₹${(value * 1000).toLocaleString('en-IN')}`;
    }
    if (labelStr.includes("3-way match tolerance")) {
      return `3-way match tolerance — ±${value / 10}%`;
    }
    if (labelStr.includes("Target service level")) {
      return `Target service level — ${value}%`;
    }
    return labelStr;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="Role-based access and the autonomy policy that decides when the AI acts alone."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Role-based access" subtitle="Modules visible per role">
          <ul className="space-y-3">
            {roles.map((r: any) => (
              <li key={r.role} className="rounded-xl border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{r.role}</p>
                  <Pill tone="primary">Active</Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.modules}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="Autonomy controls">
            <ul className="space-y-3">
              {toggles.map((t: any) => (
                <li
                  key={t.label}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div>
                    <p className="text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc || t.description}</p>
                  </div>
                  <Switch 
                    checked={Boolean(t.enabled || t.on)}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: t.id, enabled: checked })} 
                  />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Thresholds">
            <div className="space-y-6">
              {thresholds.map((th: any) => (
                <div key={th.label}>
                  <Label className="text-xs text-muted-foreground">
                    {getLabelText(th.label, th.value)}
                  </Label>
                  <Slider 
                    value={[th.value]} 
                    max={th.max_val || 100} 
                    step={th.step || 5} 
                    className="mt-3" 
                    onValueChange={(val) => thresholdMutation.mutate({ id: th.id, value: val[0] })}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
