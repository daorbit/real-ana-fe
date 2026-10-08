import { SegmentedControl } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { NavItem } from "@/app/shell/navItems";
import { LOCKED_NAV_ITEMS, setNavItemState, type NavItemState } from "@/app/shell/navPrefs";
import classes from "./Sidebar.module.css";

export function SidebarItemRow({ item, state }: { item: NavItem; state: NavItemState }) {
  const { t } = useTranslation();
  const label = t(item.labelKey, item.label);
  const locked = LOCKED_NAV_ITEMS.has(item.to);
  const Icon = item.icon;

  return (
    <div className={classes.row} data-state={state}>
      <span className={classes.icon}>
        <Icon size={15} />
      </span>
      <span className={classes.label}>{label}</span>
      <SegmentedControl
        size="xs"
        radius="md"
        className={classes.segment}
        value={state}
        onChange={(v) => setNavItemState(item.to, v as NavItemState)}
        aria-label={`${label} visibility`}
        data={[
          { value: "pinned", label: "Pinned" },
          { value: "shown", label: "Shown" },
          { value: "hidden", label: "Hidden", disabled: locked },
        ]}
      />
    </div>
  );
}
