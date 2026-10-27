import type { WorkspaceAppId } from "@/shared/types";
import { appLogoUrl } from "@/shared/lib/appLogo";
import type { NavItem } from "./navItems";

const APP_IMAGE_FILE: Partial<Record<WorkspaceAppId, string>> = {
  invoicing: "quantalog-invoicing.png",
};

export function navImage(item: Pick<NavItem, "app">): string | undefined {
  if (typeof item.app === "string") return appLogoUrl(APP_IMAGE_FILE[item.app] ?? `quantalog-${item.app}.svg`);
  return undefined;
}

export function NavItemIcon({ item, size }: { item: Pick<NavItem, "app" | "icon" | "tone">; size: number }) {
  const image = navImage(item);
  if (image) return <img src={image} width={size} height={size} alt="" className="nav-app-logo" />;
  const Icon = item.icon;
  return <Icon size={size} className="nav-tone-icon" data-tone={item.tone} />;
}
