import { useMemo } from "react";
import { useWorkspaceApps, type EnabledApps } from "@/features/workspace/useWorkspaceApps";
import { NAV_GROUPS, type NavGroup } from "./navItems";
import { useNavPrefs } from "./navPrefs";
import { applyNavPrefs } from "./applyNavPrefs";

function hideDisabledApps(groups: NavGroup[], apps: EnabledApps): NavGroup[] {
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.app || apps[item.app]) }))
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
