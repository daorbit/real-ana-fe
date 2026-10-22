import type { LucideIcon } from "lucide-react";
import type { NavTone } from "./navItems";

const MENU_ICON_SIZE = 17;

export function MenuToneIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: NavTone }) {
  return <Icon size={MENU_ICON_SIZE} className="nav-tone-icon" data-tone={tone} />;
}
