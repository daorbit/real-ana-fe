import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import { ACCENT } from "@/shared/ui/StatCard";

export type DeviceMeta = { id: string; label: string; icon: LucideIcon; color: string };

const DEVICES: Record<string, DeviceMeta> = {
  MOBILE: { id: "MOBILE", label: "Mobile", icon: Smartphone, color: ACCENT.emerald },
  DESKTOP: { id: "DESKTOP", label: "Desktop", icon: Monitor, color: ACCENT.cyan },
  TABLET: { id: "TABLET", label: "Tablet", icon: Tablet, color: ACCENT.amber },
};

export function deviceMeta(key: string): DeviceMeta {
  return DEVICES[key.toUpperCase()] ?? { id: key, label: key, icon: Monitor, color: ACCENT.pink };
}
