import { CalendarRange, FileText, LayoutGrid, Radio, Search, ShoppingBag, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardOrbitMode } from "@/features/dashboards/types";

export type OrbitStarter = { text: string; short: string; icon: LucideIcon };

export const ORBIT_STARTERS: Record<DashboardOrbitMode, OrbitStarter[]> = {
  create: [
    { text: "A monthly SEO report I can share with a client", short: "Client SEO report", icon: Search },
    { text: "Store traffic, campaigns and what actually converts", short: "Store performance", icon: ShoppingBag },
    { text: "What people read on my blog and where they come from", short: "Content and readers", icon: FileText },
    { text: "A live view of who is on the site right now", short: "Live monitor", icon: Radio },
  ],
  edit: [
    { text: "Add Google Search performance and top queries", short: "Add search", icon: Search },
    { text: "Focus this on conversions and goals", short: "Conversions", icon: Target },
    { text: "Make it more compact, keep only the essentials", short: "Compact", icon: LayoutGrid },
    { text: "Show the last 30 days by default", short: "30 days", icon: CalendarRange },
  ],
};
