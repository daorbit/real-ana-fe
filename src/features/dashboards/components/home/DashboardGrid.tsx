import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { DashboardCard } from "@/features/dashboards/components/home/DashboardCard";
import type { CardBusy } from "@/features/dashboards/components/home/DashboardCard";
import type { Dashboard } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function DashboardGrid({
  dashboards,
  canEdit,
  showNew,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dashboards: Dashboard[];
  canEdit: boolean;
  showNew: boolean;
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
        <UnstyledButton component={Link} to="/app/dashboards/new" className={classes.newTile}>
          <span className={classes.newTileIcon}><Plus size={18} /></span>
          <span className={classes.newTileTitle}>New dashboard</span>
          <span className={classes.newTileText}>From a template or a blank canvas</span>
        </UnstyledButton>
      )}
    </div>
  );
}
