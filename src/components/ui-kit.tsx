import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Tone = "primary" | "ok" | "warn" | "critical" | "ai" | "muted";

const toneText: Record<Tone, string> = {
  primary: "text-primary",
  ok: "text-ok",
  warn: "text-warn",
  critical: "text-critical",
  ai: "text-ai",
  muted: "text-muted-foreground",
};

const toneRing: Record<Tone, string> = {
  primary: "border-primary/30 bg-primary/10",
  ok: "border-ok/30 bg-ok/10",
  warn: "border-warn/30 bg-warn/10",
  critical: "border-critical/30 bg-critical/10",
  ai: "border-ai/30 bg-ai/10",
  muted: "border-border bg-muted/40",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: Tone;
}) {
  return (
    <div className={cn("rounded-xl border p-4", toneRing[tone])}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold", toneText[tone])}>{value}</p>
      {delta ? <p className="mt-1 text-[11px] text-muted-foreground">{delta}</p> : null}
    </div>
  );
}

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        toneRing[tone],
        toneText[tone],
      )}
    >
      {children}
    </span>
  );
}

export function AiCard({
  title,
  children,
  actions,
  tone = "ai",
}: {
  title: string;
  children: ReactNode;
  actions?: { label: string; variant?: "default" | "outline" | "secondary"; onClick?: () => void }[];
  tone?: Tone;
}) {
  return (
    <div className={cn("rounded-xl border p-4", toneRing[tone])}>
      <div className="flex items-center gap-2">
        <Sparkles className={cn("size-4", toneText[tone])} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
      {actions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant={a.variant ?? "default"}
              onClick={a.onClick ?? (() => toast.success(`${a.label} — action completed`))}
            >
              {a.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: Tone }) {
  const bg: Record<Tone, string> = {
    primary: "bg-primary",
    ok: "bg-ok",
    warn: "bg-warn",
    critical: "bg-critical",
    ai: "bg-ai",
    muted: "bg-muted-foreground",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn("h-full rounded-full", bg[tone])} style={{ width: `${value}%` }} />
    </div>
  );
}

export function StageChip({
  index,
  name,
  status,
  detail,
}: {
  index: number;
  name: string;
  status: "auto" | "review" | "exception";
  detail?: string;
}) {
  const map = {
    auto: { tone: "ok" as Tone, label: "Automated" },
    review: { tone: "warn" as Tone, label: "Requires Review" },
    exception: { tone: "critical" as Tone, label: "Exception" },
  }[status];

  return (
    <div className={cn("rounded-xl border p-4", toneRing[map.tone])}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Pill tone={map.tone}>{map.label}</Pill>
      </div>
      <p className="mt-2 text-sm font-semibold">{name}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

type ActionRowAction = { label: string; variant?: "default" | "outline" | "secondary"; disabled?: boolean; onClick?: () => void };

export function ActionRow({ labels, onAction, actions, title, subtitle, status, disabled }: {
  labels?: string[];
  onAction?: (label: string) => void;
  actions?: ActionRowAction[];
  title?: string;
  subtitle?: string;
  status?: string;
  disabled?: boolean;
}) {
  const resolvedActions: ActionRowAction[] = actions || (labels || []).map((label, i) => ({
    label,
    variant: i === 0 ? "default" as const : "outline" as const,
    disabled: false,
    onClick: onAction ? () => onAction(label) : undefined
  }));

  return (
    <div className={title ? "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3" : "flex flex-wrap gap-2"}>
      {title && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      )}
      {status && (
        <Pill tone={status === 'pending' ? 'warn' : status === 'approved' ? 'ok' : 'muted'}>
          {status}
        </Pill>
      )}
      <div className="flex flex-wrap gap-2">
        {resolvedActions.map((a, i) => (
          <Button
            key={a.label}
            size="sm"
            variant={a.variant ?? (i === 0 ? "default" : "outline")}
            disabled={disabled || a.disabled}
            onClick={() => {
              if (a.onClick) {
                a.onClick();
              } else if (onAction) {
                onAction(a.label);
              } else {
                toast.success(`${a.label} — action completed`);
              }
            }}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
