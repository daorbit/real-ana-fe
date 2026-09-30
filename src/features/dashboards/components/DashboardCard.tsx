import { ActionIcon, Loader, Menu } from "@mantine/core";
import { ArrowUpRight, CalendarRange, Clock3, Copy, LayoutGrid, MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { timeAgo } from "@/shared/lib";
import { LayoutThumb } from "@/features/dashboards/components/LayoutThumb";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { rangeLong } from "@/features/dashboards/types";
import type { Dashboard } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export type CardBusy = "deleting" | "duplicating" | null;

const BUSY_LABEL = { deleting: "Deleting…", duplicating: "Duplicating…" };

export function DashboardCard({
  dashboard,
  index,
  canEdit,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dashboard: Dashboard;
  index: number;
  canEdit: boolean;
  busy: CardBusy;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const template = TEMPLATE_MAP[dashboard.template] ?? TEMPLATE_MAP.blank;
  const count = dashboard.layout.length;
  const Icon = template.icon;

  return (
    <motion.div
      className={`${classes.card} ${classes.accent}`}
      data-accent={template.accent}
      role="link"
      tabIndex={0}
      aria-busy={Boolean(busy)}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {busy && (
        <div className={classes.busy}>
          <Loader size="sm" color="gray" />
          {BUSY_LABEL[busy]}
        </div>
      )}

      <div className={classes.cardPreview}>
        <span className={classes.chip}>
          <span className={classes.chipIcon}><Icon size={11} /></span>
          {template.id === "blank" ? "Custom" : template.name}
        </span>
        <span className={classes.openPill}>
          Open <ArrowUpRight size={12} />
        </span>
        <LayoutThumb layout={dashboard.layout} />
      </div>

      <div className={classes.cardBody}>
        <div className={classes.cardText}>
          <div className={classes.cardName}>{dashboard.name}</div>
          <div className={classes.metaRow}>
            <span className={classes.metaTag}><LayoutGrid size={11} />{count} widget{count === 1 ? "" : "s"}</span>
            <span className={classes.metaTag}><CalendarRange size={11} />{rangeLong(dashboard.range)}</span>
            <span className={classes.metaTag}><Clock3 size={11} />{timeAgo(dashboard.updatedAt)}</span>
          </div>
        </div>
        {canEdit && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Dashboard actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item leftSection={<Copy size={14} />} onClick={onDuplicate}>Duplicate</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    </motion.div>
  );
}
