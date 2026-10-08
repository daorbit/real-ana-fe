import { useMemo } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { GripVertical, Pin, PinOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_GROUPS, type NavItem } from "@/app/shell/navItems";
import { withItemState, withPinnedOrder } from "@/app/shell/navPrefs";
import { InsetSection } from "./InsetSection";
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
    <InsetSection
      title="Pinned"
      footer={`Pinned pages sit at the top of the sidebar for everyone in ${workspaceName}.${items.length > 1 && editable ? " Drag to reorder." : ""}`}
    >
      {items.length === 0 ? (
        <div className={classes.empty}>
          <span className={classes.emptyIcon}>
            <Pin size={16} />
          </span>
          <span>Pin the pages your team opens most to keep them one click away.</span>
        </div>
      ) : (
        <SortableList
          items={items}
          disabled={!editable}
          onReorder={(from, to) => apply(withPinnedOrder(prefs, from, to))}
          renderItem={(item, handle) => {
            const Icon = item.icon;
            const label = t(item.labelKey, item.label);
            return (
              <div className={classes.row}>
                <span className={classes.tile} data-accent>
                  <Icon size={16} />
                </span>
                <span className={classes.rowText}>
                  <span className={classes.rowLabel}>{label}</span>
                </span>
                {editable && (
                  <span className={classes.rowActions}>
                    <Tooltip label="Unpin" withArrow openDelay={300}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size={32}
                        radius="md"
                        onClick={() => apply(withItemState(prefs, item.to, "shown"))}
                        aria-label={`Unpin ${label}`}
                      >
                        <PinOff size={16} />
                      </ActionIcon>
                    </Tooltip>
                    {items.length > 1 && (
                      <span className={classes.grip} {...handle} aria-label={`Reorder ${label}`}>
                        <GripVertical size={16} />
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          }}
        />
      )}
    </InsetSection>
  );
}
