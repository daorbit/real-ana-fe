import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Rings } from "@/features/goals/components/ProgressRing";
import { formatMetric, percentLabel, targetStatus } from "@/features/goals/metrics";
import { RING_PALETTE } from "@/features/goals/tones";
import type { TargetProgress } from "@/features/goals/types";
import classes from "@/features/goals/components/Goals.module.css";

function headline(targets: TargetProgress[]) {
  const statuses = targets.map(targetStatus);
  const hit = statuses.filter((s) => s === "achieved").length;
  const good = statuses.filter((s) => s === "achieved" || s === "onTrack").length;
  const behind = statuses.filter((s) => s === "behind").length;

  if (hit === targets.length) return { title: "Every goal hit.", sub: "Take the win — and maybe raise the bar." };
  const title = `${good} of ${targets.length} goal${targets.length === 1 ? "" : "s"} on track`;
  const parts = [hit && `${hit} achieved`, behind && `${behind} behind pace`].filter(Boolean);
  return { title, sub: parts.length ? parts.join(" · ") : "Steady progress across the board." };
}

export function GoalsHero({ targets }: { targets: TargetProgress[] }) {
  const featured = targets.filter((t) => t.status === "ok").slice(0, 3);
  const shown = featured.length ? featured : targets.slice(0, 3);
  const avg = shown.length ? shown.reduce((s, t) => s + t.progress, 0) / shown.length : 0;
  const { title, sub } = headline(targets);
  const lead = targets[0];

  return (
    <motion.section
      className={classes.hero}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Rings
        size={200}
        stroke={18}
        gap={4}
        rings={shown.map((t, i) => ({ value: t.progress, tone: RING_PALETTE[i] }))}
      >
        <span className={classes.heroCenterValue}>{Math.round(avg * 100)}%</span>
        <span className={classes.heroCenterLabel}>overall</span>
      </Rings>

      <div className={classes.heroBody}>
        <div>
          {lead && (
            <span className={classes.eyebrow}>
              <CalendarDays size={13} />
              {lead.periodLabel} · {lead.daysLeft} day{lead.daysLeft === 1 ? "" : "s"} left
            </span>
          )}
          <h2 className={classes.heroTitle}>{title}</h2>
          <p className={classes.heroSub}>{sub}</p>
        </div>

        <div className={classes.legend}>
          {shown.map((t, i) => (
            <div key={t.id} className={classes.legendRow}>
              <Rings size={34} stroke={5} rings={[{ value: t.progress, tone: RING_PALETTE[i] }]} delay={0.2} />
              <div className={classes.legendText}>
                <div className={classes.legendName}>{t.name}</div>
                <div className={classes.legendValue}>
                  {t.status === "ok"
                    ? `${formatMetric(t.metric, t.current ?? 0, true)} / ${formatMetric(t.metric, t.target, true)}`
                    : "Needs setup"}
                </div>
              </div>
              <span className={classes.legendPct}>{percentLabel(t)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
