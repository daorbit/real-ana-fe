import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { timeAgo } from "@/shared/lib";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { DashboardMenu } from "@/features/dashboards/components/home/DashboardMenu";
import { CardBusyOverlay } from "@/features/dashboards/components/home/CardBusyOverlay";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { rangeLong } from "@/features/dashboards/types";
import type { Dashboard } from "@/features/dashboards/types";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

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
      data-busy={busy ?? undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: busy === "deleting" ? 0.985 : 1 }}
      exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)", transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
      transition={{
        delay: Math.min(index, 8) * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.25 },
      }}
    >
      {busy && <CardBusyOverlay state={busy} />}

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
