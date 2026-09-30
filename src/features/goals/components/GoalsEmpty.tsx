import { Button, UnstyledButton } from "@mantine/core";
import { ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Rings, ProgressRing } from "@/features/goals/components/ProgressRing";
import { METRIC_MAP } from "@/features/goals/metrics";
import { RING_PALETTE } from "@/features/goals/tones";
import type { TargetInput } from "@/features/goals/types";
import classes from "@/features/goals/components/Goals.module.css";

const PRESETS: (TargetInput & { number: string; unit: string; eyebrow: string; hint: string; preview: number })[] = [
  {
    name: "10K visitors this month", metric: "visitors", target: 10_000, period: "month",
    number: "10K", unit: "visitors", eyebrow: "Monthly · Traffic", preview: 0.72,
    hint: "The headline number. Watch the ring close as the month goes on.",
  },
  {
    name: "500 form submissions this month", metric: "formSubmissions", target: 500, period: "month",
    number: "500", unit: "submissions", eyebrow: "Monthly · Leads", preview: 0.54,
    hint: "Every response your lead-capture forms collect counts toward it.",
  },
  {
    name: "Average position under 5", metric: "searchPosition", target: 5, period: "quarter",
    number: "< 5", unit: "avg. position", eyebrow: "Quarterly · Search", preview: 0.38,
    hint: "Climb into the top half of Google's first page.",
  },
];

export function GoalsEmpty({
  canEdit,
  onCreate,
}: {
  canEdit: boolean;
  onCreate: (preset?: TargetInput) => void;
}) {
  return (
    <>
      <motion.section
        className={classes.empty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={classes.emptyVisual}>
          <Rings
            size={176}
            stroke={16}
            gap={4}
            rings={[
              { value: 0.82, tone: RING_PALETTE[0] },
              { value: 0.61, tone: RING_PALETTE[1] },
              { value: 0.44, tone: RING_PALETTE[2] },
            ]}
          />
        </div>
        <h2 className={classes.emptyTitle}>Close your rings.</h2>
        <p className={classes.emptyText}>
          Set a monthly or quarterly target for traffic, leads or search ranking. Progress fills in on its own —
          and you'll get a celebration the moment you hit it.
        </p>
        {canEdit && (
          <Button size="md" radius="xl" color="emerald" mt={8} leftSection={<Plus size={16} />} onClick={() => onCreate()}>
            Create a goal
          </Button>
        )}
      </motion.section>

      {canEdit && (
        <>
          <div className={classes.presetsHead}>Or start with one of these</div>
          <div className={classes.presets}>
            {PRESETS.map(({ number, unit, eyebrow, hint, preview, ...preset }, i) => {
              const Icon = METRIC_MAP[preset.metric].icon;
              return (
                <motion.div
                  key={preset.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <UnstyledButton className={classes.preset} data-index={i} onClick={() => onCreate(preset)} w="100%">
                    <div className={classes.presetTop}>
                      <ProgressRing value={preview} tone={RING_PALETTE[i]} size={52} stroke={6} delay={0.3 + i * 0.1}>
                        <Icon size={16} className={classes.presetIcon} />
                      </ProgressRing>
                      <span className={classes.presetCta}>
                        Use this goal <ArrowRight size={13} />
                      </span>
                    </div>
                    <div className={classes.presetBody}>
                      <div className={classes.presetEyebrow}>{eyebrow}</div>
                      <div className={classes.presetNumber}>
                        {number}
                        <span className={classes.presetUnit}>{unit}</span>
                      </div>
                      <div className={classes.presetHint}>{hint}</div>
                    </div>
                  </UnstyledButton>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
