import { Loader } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { timeAgo } from "@/shared/lib";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { DashboardMenu } from "@/features/dashboards/components/home/DashboardMenu";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { rangeLong } from "@/features/dashboards/types";
import type { Dashboard } from "@/features/dashboards/types";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

export type CardBusy = "deleting" | "duplicating" | null;

export const BUSY_LABEL = { deleting: "Deleting…", duplicating: "Duplicating…" };

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
      className={`${classes.card} ${shared.accent}`}
      data-accent={template.accent}
      role="link"
      tabIndex={0}
      aria-busy={Boolean(busy)}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {busy && (
        <div className={classes.busy}>
          <Loader size="sm" color="gray" />
          {BUSY_LABEL[busy]}
        </div>
      )}

      <div className={classes.cardPreview}>
        <MiniWindow layout={dashboard.layout} title={dashboard.name} />
        <span className={classes.openPill}>
          Open <ArrowUpRight size={12} />
        </span>
      </div>

      <div className={classes.cardBody}>
        <span className={classes.cardIcon}><Icon size={17} /></span>
        <div className={classes.cardText}>
          <div className={classes.cardName} title={dashboard.name}>{dashboard.name}</div>
          <div className={classes.cardMeta}>
            {count} widget{count === 1 ? "" : "s"}
            <span className={classes.metaDot} />
            {rangeLong(dashboard.range)}
          </div>
        </div>
        {canEdit && <DashboardMenu onDuplicate={onDuplicate} onDelete={onDelete} />}
      </div>

      <div className={classes.cardFoot}>
        <span className={classes.cardTemplate}>{template.id === "blank" ? "Custom" : template.name}</span>
        <span>Edited {timeAgo(dashboard.updatedAt)}</span>
      </div>
    </motion.div>
  );
}
