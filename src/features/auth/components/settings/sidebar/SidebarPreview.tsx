import { useMemo } from "react";
import { ActionIcon } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_GROUPS } from "@/app/shell/navItems";
import { applyNavPrefs, PINNED_HEADING_KEY } from "@/app/shell/applyNavPrefs";
import { moveNavPinned, type NavPrefs } from "@/app/shell/navPrefs";
import classes from "./Sidebar.module.css";

export function SidebarPreview({ prefs }: { prefs: NavPrefs }) {
  const { t } = useTranslation();
  const groups = useMemo(() => applyNavPrefs(NAV_GROUPS, prefs), [prefs]);

  return (
    <div className={classes.preview} aria-label="Sidebar preview">
      <span className={classes.previewTag}>Preview</span>
      {groups.map((group) => {
        const pinnedGroup = group.headingKey === PINNED_HEADING_KEY;
        return (
          <div key={group.headingKey} className={classes.previewGroup}>
            <span className={classes.previewHeading}>{t(group.headingKey, group.heading)}</span>
            {group.items.map((item, i) => {
              const Icon = item.icon;
              const label = t(item.labelKey, item.label);
              return (
                <div key={item.to} className={classes.previewRow} data-pinned={pinnedGroup || undefined}>
                  <Icon size={14} className={classes.previewIcon} />
                  <span className={classes.previewLabel}>{label}</span>
                  {pinnedGroup && group.items.length > 1 && (
                    <span className={classes.previewMove}>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        disabled={i === 0}
                        onClick={() => moveNavPinned(item.to, -1)}
                        aria-label={`Move ${label} up`}
                      >
                        <ChevronUp size={12} />
                      </ActionIcon>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        disabled={i === group.items.length - 1}
                        onClick={() => moveNavPinned(item.to, 1)}
                        aria-label={`Move ${label} down`}
                      >
                        <ChevronDown size={12} />
                      </ActionIcon>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
