import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Boxes,
  Brain,
  ClipboardCheck,
  FileSearch,
  Gauge,
  LayoutDashboard,
  MessagesSquare,
  PackageCheck,
  Repeat,
  ScrollText,
  Settings,
  ShieldAlert,
  Sparkles,
  Split,
  Truck,
  Wallet,
} from "lucide-react";

const groups: {
  label: string;
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Executive Dashboard", icon: LayoutDashboard },
      { to: "/command-center", label: "AI Command Center", icon: Sparkles },
    ],
  },
  {
    label: "Demand & Inventory",
    items: [
      { to: "/demand", label: "Demand Intelligence", icon: Activity },
      { to: "/inventory", label: "Inventory Control", icon: Boxes },
      { to: "/allocation", label: "Smart Allocation", icon: Split },
    ],
  },
  {
    label: "Replenishment",
    items: [{ to: "/replenishment", label: "AI Replenishment", icon: Repeat }],
  },
  {
    label: "Procurement",
    items: [
      { to: "/assistant", label: "Procurement Assistant", icon: MessagesSquare },
      { to: "/sourcing", label: "Smart Sourcing", icon: Brain },
      { to: "/purchase-orders", label: "Purchase Orders", icon: ScrollText },
    ],
  },
  {
    label: "Autonomous P2P",
    items: [
      { to: "/p2p", label: "P2P Control Tower", icon: Bot },
      { to: "/goods-receipt", label: "Goods Receiving", icon: Truck },
      { to: "/invoices", label: "Invoice OCR", icon: FileSearch },
      { to: "/three-way-match", label: "3-Way Match", icon: ClipboardCheck },
      { to: "/payments", label: "Payments", icon: Wallet },
      { to: "/exceptions", label: "Exceptions", icon: ShieldAlert },
    ],
  },
  {
    label: "Insight",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/alerts", label: "Alerts & Escalations", icon: AlertTriangle },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Gauge className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">MedCare Pharma</p>
          <p className="text-[11px] text-muted-foreground">Supply Chain Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{
                      className:
                        "bg-sidebar-accent text-sidebar-accent-foreground border-primary/50",
                    }}
                    className="flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60"
                  >
                    <item.icon className="size-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-ai/20 text-ai">
            <PackageCheck className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-medium">Nishant</p>
            <p className="text-[11px] text-muted-foreground">Supply Chain Head</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
