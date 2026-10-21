import { useMemo } from "react";
import { useWorkspaceApps, type EnabledApps } from "@/features/workspace/useWorkspaceApps";
import { NAV_GROUPS, type NavGroup, type NavItem } from "./navItems";
import { useNavPrefs } from "./navPrefs";
import { applyNavPrefs } from "./applyNavPrefs";

function itemVisible(item: NavItem, apps: EnabledApps): boolean {
  if (!item.app) return true;
  return Array.isArray(item.app) ? item.app.some((id) => apps[id]) : apps[item.app];
}

function hideDisabledApps(groups: NavGroup[], apps: EnabledApps): NavGroup[] {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => itemVisible(item, apps)) }))
    .filter((group) => group.items.length > 0);
}

export function useNavGroups(): NavGroup[] {
  const navPrefs = useNavPrefs();
  const apps = useWorkspaceApps();
  return useMemo(
    () => hideDisabledApps(applyNavPrefs(NAV_GROUPS, apps.links ? navPrefs : { ...navPrefs, links: [] }), apps),
    [navPrefs, apps],
  );
}
