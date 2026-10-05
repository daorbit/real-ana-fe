import type { TFunction } from "i18next";
import { Search, Globe2, CalendarClock, ClipboardList, Image as ImageIcon } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";


const CREDIT_TYPE_KEY: Record<string, string> = {
  audit: "billing.typeAudit",
  crawl: "billing.typeCrawl",
  orbit: "billing.typeOrbit",
  "post-slots": "billing.typePostSlot",
  "form-submissions": "billing.typeFormResponse",
  "media-slots": "billing.typeMedia",
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
  "media-slots": ImageIcon,
};

const TYPE_ORDER = ["audit", "crawl", "orbit", "form-submissions", "post-slots", "media-slots"];

export function sortPacks<T extends { type: string; quantity: number }>(packs: T[]): T[] {
  const rank = (type: string) => {
    const i = TYPE_ORDER.indexOf(type);
    return i === -1 ? TYPE_ORDER.length : i;
  };
  return [...packs].sort((a, b) => rank(a.type) - rank(b.type) || a.quantity - b.quantity);
}

export function PackIcon({ type, size }: { type: string; size?: number }) {
  const Icon = PACK_ICON[type] ?? Globe2;
  return <Icon size={size} />;
}
