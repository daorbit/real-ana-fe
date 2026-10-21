import { useMemo } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { GripVertical, Pin, PinOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_GROUPS, type NavItem } from "@/app/shell/navItems";
import { NavItemIcon } from "@/app/shell/NavItemIcon";
import { withItemState, withPinnedOrder } from "@/app/shell/navPrefs";
import { SidebarCard } from "./SidebarCard";
import { SortableList } from "./SortableList";
import type { NavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

const BY_PATH = new Map(NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.to, i] as const)));

export function PinnedSection({ editor, workspaceName }: { editor: NavPrefsEditor; workspaceName: string }) {
  const { t } = useTranslation();
  const { prefs, editable, apply } = editor;

  const items = useMemo(
    () =>
      prefs.pinned
        .map((to) => BY_PATH.get(to))
        .filter((i): i is NavItem => Boolean(i))
        .map((i) => ({ ...i, id: i.to })),
    [prefs.pinned],
  );

  return (
    <SidebarCard
      title="Pinned"
      description={`Shown first in the sidebar for everyone in ${workspaceName}.${
        items.length > 1 && editable ? " Drag to reorder." : ""
      }`}
    >
      {items.length === 0 ? (
        <div className={classes.empty}>
          <span className={classes.emptyIcon}>
            <Pin size={15} />
          </span>
          <span>Nothing pinned yet. Use the pin next to a page to keep it one click away.</span>
        </div>
      ) : (
        <SortableList
          items={items}
          disabled={!editable}
          onReorder={(from, to) => apply(withPinnedOrder(prefs, from, to))}
          renderItem={(item, handle) => {
            const label = t(item.labelKey, item.label);
            return (
              <div className={classes.row}>
                {editable && items.length > 1 && (
                  <span className={classes.grip} {...handle} aria-label={`Reorder ${label}`}>
                    <GripVertical size={15} />
                  </span>
                )}
                <span className={classes.tile} data-accent>
                  <NavItemIcon item={item} size={16} />
                </span>
                <span className={classes.rowLabel}>{label}</span>
                {editable && (
                  <Tooltip label="Unpin" withArrow openDelay={300}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size={30}
                      radius="md"
                      onClick={() => apply(withItemState(prefs, item.to, "shown"))}
                      aria-label={`Unpin ${label}`}
                    >
                      <PinOff size={15} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </div>
            );
          }}
        />
      )}
    </SidebarCard>
  );
}
