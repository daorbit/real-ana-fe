import { motion } from "framer-motion";
import { Copy, Trash2 } from "lucide-react";
import { BUSY_LABEL } from "@/features/dashboards/components/home/cardBusy";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function CardBusyOverlay({ state }: { state: Exclude<CardBusy, null> }) {
  const Icon = state === "deleting" ? Trash2 : Copy;

  return (
    <motion.div
      className={classes.busy}
      data-state={state}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      role="status"
    >
      <span className={classes.busyBadge}>
        <span className={classes.busyRing} />
        <Icon size={16} />
      </span>
      <span className={classes.busyLabel}>{BUSY_LABEL[state]}</span>
    </motion.div>
  );
}
