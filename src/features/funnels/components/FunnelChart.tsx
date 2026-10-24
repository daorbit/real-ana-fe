import { useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { num } from "@/shared/lib";
import type { FunnelResultStep } from "@/shared/types";
import { percentLabel } from "../lib/funnelFormat";
import classes from "./FunnelResults.module.css";

type Mode = "start" | "previous";

const MODES = [
  { value: "start", label: "From first step" },
  { value: "previous", label: "From previous step" },
];

function FunnelBar({ rate, previousRate, reached }: { rate: number; previousRate: number; reached: boolean }) {
  const solid = reached ? Math.max(rate, 1.5) : 0;
  const lost = Math.max(0, previousRate - solid);
  return (
    <svg className={classes.bar} viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden>
      <rect className={classes.barTrack} x="0" y="0" width="40" height="100" />
      {lost > 0 && <rect className={classes.barLost} x="0" y={100 - previousRate} width="40" height={lost} />}
      {solid > 0 && <rect className={classes.barSolid} x="0" y={100 - solid} width="40" height={solid} />}
    </svg>
  );
}

export function FunnelChart({ steps, worstIndex }: { steps: FunnelResultStep[]; worstIndex: number | null }) {
  const [mode, setMode] = useState<Mode>("start");

  return (
    <section className={classes.chartBlock} aria-label="Funnel chart">
      <div className={classes.chartTools}>
        <SegmentedControl size="xs" radius="xl" value={mode} onChange={(v) => setMode(v as Mode)} data={MODES} />
        <div className={classes.legend}>
          <span className={classes.legendItem}>
            <span className={classes.swatch} data-kind="solid" />
            Continued
          </span>
          <span className={classes.legendItem}>
            <span className={classes.swatch} data-kind="lost" />
            Lost since previous step
          </span>
        </div>
      </div>

      <ol className={classes.columns}>
        {steps.map((step, i) => {
          const shown = mode === "start" ? step.rate : step.stepRate;
          return (
            <li key={`${step.type}:${step.label}:${i}`} className={classes.column}>
              <div className={classes.columnHead}>
                <span className={classes.columnCount}>{num(step.count)}</span>
                <span className={classes.columnRate}>{percentLabel(shown)}</span>
              </div>
              <span className={classes.columnDrop} data-worst={worstIndex === i || undefined}>
                {i === 0 ? "Entered the funnel" : `−${percentLabel(step.dropFromPrev)} from step ${i}`}
              </span>
              <FunnelBar rate={step.rate} previousRate={i === 0 ? step.rate : steps[i - 1].rate} reached={step.count > 0} />
              <span className={classes.columnStep}>
                Step {i + 1} · {step.type === "event" ? "Event" : "Page"}
              </span>
              <span className={classes.columnLabel} title={step.label}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
