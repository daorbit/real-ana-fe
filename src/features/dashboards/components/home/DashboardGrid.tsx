import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardCard } from "@/features/dashboards/components/home/DashboardCard";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import type { Dashboard } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function DashboardGrid({
  dashboards,
  canEdit,
  showNew,
  onNew,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dashboards: Dashboard[];
  canEdit: boolean;
  showNew: boolean;
  onNew: () => void;
  busy: Record<string, CardBusy>;
  onOpen: (d: Dashboard) => void;
  onDuplicate: (d: Dashboard) => void;
  onDelete: (d: Dashboard) => void;
}) {
  return (
    <div className={classes.grid}>
      <AnimatePresence>
        {dashboards.map((d, i) => (
          <DashboardCard
            key={d.id}
            dashboard={d}
            index={i}
            canEdit={canEdit}
            busy={busy[d.id] ?? null}
            onOpen={() => onOpen(d)}
            onDuplicate={() => onDuplicate(d)}
            onDelete={() => onDelete(d)}
          />
        ))}
      </AnimatePresence>
      {showNew && (
        <motion.div layout transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}>
          <UnstyledButton className={classes.newTile} onClick={onNew}>
            <span className={classes.newTileIcon}><Plus size={18} /></span>
            <span className={classes.newTileTitle}>New dashboard</span>
            <span className={classes.newTileText}>From a template or a blank canvas</span>
          </UnstyledButton>
        </motion.div>
      )}
    </div>
  );
}
