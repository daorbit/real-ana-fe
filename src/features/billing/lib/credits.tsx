import type { TFunction } from "i18next";
import { Search, Globe2, CalendarClock, ClipboardList } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

 
const CREDIT_TYPE_KEY: Record<string, string> = {
  audit: "billing.typeAudit",
  crawl: "billing.typeCrawl",
  orbit: "billing.typeOrbit",
  "post-slots": "billing.typePostSlot",
  "form-submissions": "billing.typeFormResponse",
};

export function creditType(t: TFunction, type: string, count: number): string {
  return t(CREDIT_TYPE_KEY[type] ?? "billing.typeCrawl", { count });
}

const PACK_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  audit: Search,
  crawl: Globe2,
  orbit: OrbitMark,
  "post-slots": CalendarClock,
  "form-submissions": ClipboardList,
};

export function PackIcon({ type, size }: { type: string; size?: number }) {
  const Icon = PACK_ICON[type] ?? Globe2;
  return <Icon size={size} />;
}
