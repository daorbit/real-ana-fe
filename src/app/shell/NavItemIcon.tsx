import type { NavItem } from "./navItems";

export function navImage(item: Pick<NavItem, "app">): string | undefined {
  if (typeof item.app === "string") return `/apps/quantalog-${item.app}.svg`;
  return undefined;
}

export function NavItemIcon({ item, size }: { item: Pick<NavItem, "app" | "icon" | "tone">; size: number }) {
  const image = navImage(item);
  if (image) return <img src={image} width={size} height={size} alt="" className="nav-app-logo" />;
  const Icon = item.icon;
  return <Icon size={size} className="nav-tone-icon" data-tone={item.tone} />;
}
