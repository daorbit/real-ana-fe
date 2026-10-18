import { ActionIcon, Menu, Switch } from "@mantine/core";
import { Copy, Globe, Monitor, MoreHorizontal, Pencil, Timer, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { compact } from "@/shared/lib/format";
import {
  devicesLabel,
  formatRate,
  frequencySummary,
  pagesSummary,
  triggerSummary,
} from "@/features/popups/lib/popupOptions";
import type { Popup } from "@/features/popups/types";
import { PopupSchematic } from "@/features/popups/components/PopupSchematic";
import classes from "@/features/popups/components/Popups.module.css";

export function PopupCard({
  popup,
  siteName,
  canEdit,
  busy,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  popup: Popup;
  siteName: string;
  canEdit: boolean;
  busy: boolean;
  onToggle: (enabled: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const to = `/app/popups/${popup.id}`;
  const { views, submits } = popup.stats;

  return (
    <article className={classes.card} data-off={!popup.enabled || undefined}>
      <Link to={to} className={classes.preview} aria-label={`Edit ${popup.name}`}>
        <PopupSchematic layout={popup.layout} />
        <span className={classes.status} data-live={popup.enabled || undefined}>
          <span className={classes.statusDot} />
          {popup.enabled ? "Live" : "Paused"}
        </span>
      </Link>

      <div className={classes.body}>
        <div className={classes.head}>
          <div className={classes.titleBlock}>
            <Link to={to} className={classes.title}>
              {popup.name}
            </Link>
            <div className={classes.subtitle}>{popup.formTitle || "Lead capture form"}</div>
          </div>
          {canEdit && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="Popup actions" loading={busy}>
                  <MoreHorizontal size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to={to} leftSection={<Pencil size={14} />}>
                  Edit
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={onDuplicate}>
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </div>

        <div className={classes.meta}>
          <span className={classes.metaItem}>
            <Timer size={12} />
            {triggerSummary(popup)}
          </span>
          <span className={classes.metaItem}>
            <Globe size={12} />
            {pagesSummary(popup)}
          </span>
          <span className={classes.metaItem}>
            <Monitor size={12} />
            {devicesLabel(popup.devices)}
          </span>
        </div>

        <div className={classes.metrics}>
          <div>
            <div className={classes.metricValue}>{compact(views)}</div>
            <div className={classes.metricLabel}>Views</div>
          </div>
          <div>
            <div className={classes.metricValue}>{compact(submits)}</div>
            <div className={classes.metricLabel}>Leads</div>
          </div>
          <div>
            <div className={classes.metricValue}>{formatRate(views, submits)}</div>
            <div className={classes.metricLabel}>Conversion</div>
          </div>
        </div>

        <div className={classes.foot}>
          <span>
            {siteName} · {frequencySummary(popup.showAgainDays)}
          </span>
          <Switch
            size="sm"
            checked={popup.enabled}
            disabled={!canEdit || busy}
            aria-label={popup.enabled ? "Pause popup" : "Make popup live"}
            onChange={(e) => onToggle(e.currentTarget.checked)}
          />
        </div>
      </div>
    </article>
  );
}
