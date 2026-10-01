import { ActionIcon, Button, Menu, Switch } from "@mantine/core";
import { CodeXml, MoreHorizontal, Trash2 } from "lucide-react";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { widgetIcon } from "@/features/dashboards/widgetIcons";
import { rangeLong } from "@/features/dashboards/types";
import { num, timeAgo } from "@/shared/lib";
import type { Embed } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/embeds/Embeds.module.css";

export function EmbedCard({
  embed,
  canEdit,
  onOpen,
  onToggle,
  onDelete,
}: {
  embed: Embed;
  canEdit: boolean;
  onOpen: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  const Icon = widgetIcon(embed.widget);

  return (
    <div className={classes.card} data-off={!embed.enabled || undefined}>
      <div className={classes.cardTop}>
        <span className={classes.icon}><Icon size={18} /></span>
        <div className={classes.titles}>
          <div className={classes.name}>{embed.name}</div>
          <div className={classes.sub}>
            {WIDGET_MAP[embed.widget]?.label ?? embed.widget} · {rangeLong(embed.range)}
          </div>
        </div>
        <span className={classes.status} data-live={embed.enabled || undefined}>
          <span className={classes.statusDot} />
          {embed.enabled ? "Live" : "Paused"}
        </span>
      </div>

      <div className={classes.stats}>
        <div className={classes.stat}>
          <span className={classes.statValue}>{num(embed.views)}</span>
          <span className={classes.statLabel}>views</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{embed.lastViewedAt ? timeAgo(embed.lastViewedAt) : "—"}</span>
          <span className={classes.statLabel}>last viewed</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{embed.sites.length || "All"}</span>
          <span className={classes.statLabel}>sites</span>
        </div>
      </div>

      <div className={classes.cardFoot}>
        {canEdit ? (
          <Switch
            size="sm"
            color="emerald"
            checked={embed.enabled}
            onChange={(ev) => onToggle(ev.currentTarget.checked)}
            label={embed.enabled ? "Published" : "Paused"}
          />
        ) : (
          <span />
        )}
        <div className={classes.footActions}>
          <Button variant="default" size="xs" leftSection={<CodeXml size={13} />} onClick={onOpen}>
            {canEdit ? "Edit & code" : "Get code"}
          </Button>
          {canEdit && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="Embed actions">
                  <MoreHorizontal size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </div>
    </div>
  );
}
