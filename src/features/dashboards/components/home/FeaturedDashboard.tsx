import { Button, Loader } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { timeAgo } from "@/shared/lib";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { DashboardMenu } from "@/features/dashboards/components/home/DashboardMenu";
import { TEMPLATE_MAP, layoutMix } from "@/features/dashboards/templates";
import { rangeLong } from "@/features/dashboards/types";
import { BUSY_LABEL } from "@/features/dashboards/components/home/DashboardCard";
import type { CardBusy } from "@/features/dashboards/components/home/DashboardCard";
import type { Dashboard } from "@/features/dashboards/types";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import templateClasses from "@/features/dashboards/components/templates/Templates.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function FeaturedDashboard({
  dashboard,
  canEdit,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dashboard: Dashboard;
  canEdit: boolean;
  busy: CardBusy;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const template = TEMPLATE_MAP[dashboard.template] ?? TEMPLATE_MAP.blank;
  const Icon = template.icon;
  const mix = layoutMix(dashboard.layout);

  return (
    <motion.div
      className={`${classes.featured} ${shared.accent}`}
      data-accent={template.accent}
      role="link"
      tabIndex={0}
      aria-busy={Boolean(busy)}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {busy && (
        <div className={classes.busy}>
          <Loader size="sm" color="gray" />
          {BUSY_LABEL[busy]}
        </div>
      )}

      <div className={classes.featuredPreview}>
        <MiniWindow layout={dashboard.layout} title={dashboard.name} size="lg" />
      </div>

      <div className={classes.featuredBody}>
        <span className={classes.featuredEyebrow}>
          <span className={classes.featuredIcon}><Icon size={14} /></span>
          Last edited {timeAgo(dashboard.updatedAt)}
        </span>
        <h2 className={classes.featuredName}>{dashboard.name}</h2>
        <p className={classes.featuredDesc}>
          {dashboard.description || `${dashboard.layout.length} widgets showing the ${rangeLong(dashboard.range)}.`}
        </p>

        {mix.length > 0 && (
          <div className={templateClasses.mix}>
            {mix.map((m) => (
              <div key={m.group} className={templateClasses.mixItem}>
                <span className={templateClasses.mixValue}>{m.count}</span>
                <span className={templateClasses.mixLabel}>{m.group}</span>
              </div>
            ))}
          </div>
        )}

        <div className={classes.featuredActions}>
          <Button color="emerald" rightSection={<ArrowRight size={15} />} onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Open dashboard
          </Button>
          <span className={classes.featuredRange}>{rangeLong(dashboard.range)}</span>
          {canEdit && <DashboardMenu onDuplicate={onDuplicate} onDelete={onDelete} />}
        </div>
      </div>
    </motion.div>
  );
}
