import { ActionIcon, Menu, Switch } from "@mantine/core";
import { Globe, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { compact } from "@/shared/lib/format";
import {
  conversionRate,
  frequencySummary,
  pagesSummary,
  triggerSummary,
  DEVICE_OPTIONS,
  LAYOUT_OPTIONS,
} from "@/features/popups/lib/popupOptions";
import type { Popup } from "@/features/popups/types";
import classes from "@/features/popups/components/Popups.module.css";

export function PopupCard({
  popup,
  siteName,
  canEdit,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  popup: Popup;
  siteName: string;
  canEdit: boolean;
  busy: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const layout = LAYOUT_OPTIONS.find((o) => o.value === popup.layout)?.label;
  const devices = DEVICE_OPTIONS.find((o) => o.value === popup.devices)?.label;

  return (
    <article className={classes.card} data-off={!popup.enabled || undefined}>
      <div className={classes.cardHead}>
        <div className={classes.cardTitleWrap}>
          <div className={classes.cardTitle}>{popup.name}</div>
          <div className={classes.cardForm}>{popup.formTitle || "Lead capture form"}</div>
        </div>
        <Switch
          checked={popup.enabled}
          disabled={!canEdit || busy}
          aria-label={popup.enabled ? "Turn popup off" : "Turn popup on"}
          onChange={(e) => onToggle(e.currentTarget.checked)}
        />
        {canEdit && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="Popup actions">
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>
                Edit
              </Menu.Item>
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      <div className={classes.cardBody}>
        <div className={classes.chips}>
          <span className={classes.chip}>{triggerSummary(popup)}</span>
          <span className={classes.chip}>{layout}</span>
          <span className={classes.chip}>{pagesSummary(popup)}</span>
          <span className={classes.chip}>{devices}</span>
        </div>

        <div className={classes.stats}>
          <div className={classes.stat}>
            <div className={classes.statValue}>{compact(popup.stats.views)}</div>
            <div className={classes.statLabel}>Views</div>
          </div>
          <div className={classes.stat}>
            <div className={classes.statValue}>{compact(popup.stats.submits)}</div>
            <div className={classes.statLabel}>Submissions</div>
          </div>
          <div className={classes.stat}>
            <div className={classes.statValue}>{conversionRate(popup)}</div>
            <div className={classes.statLabel}>Conversion</div>
          </div>
        </div>
      </div>

      <div className={classes.cardFoot}>
        <span className={classes.site}>
          <Globe size={13} />
          {siteName}
        </span>
        <span>{frequencySummary(popup.showAgainDays)}</span>
      </div>
    </article>
  );
}
