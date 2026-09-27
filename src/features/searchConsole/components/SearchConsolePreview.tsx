import { Text } from "@mantine/core";
import { ArrowUpRight, CheckCircle2, Target } from "lucide-react";
import classes from "./connect.module.css";

const METRICS = [
  { label: "Clicks", value: "12.4K", delta: "+18%", tone: "clicks" },
  { label: "Impressions", value: "486K", delta: "+32%", tone: "impressions" },
];

const CLICKS_LINE = "M0,86 C30,80 50,84 80,70 S130,60 160,62 S210,44 240,40 S290,30 320,22";
const IMPRESSIONS_LINE = "M0,70 C30,66 50,72 80,58 S130,50 160,44 S210,40 240,30 S290,18 320,12";

export function SearchConsolePreview() {
  return (
    <div className={classes.preview} aria-hidden>
      <div className={classes.panel}>
        <div className={classes.panelHead}>
          <Text size="sm" fw={650}>
            Performance
          </Text>
          <Text size="xs" c="dimmed">
            Last 28 days
          </Text>
        </div>

        <div className={classes.metrics}>
          {METRICS.map((m) => (
            <div key={m.label} className={classes.metric}>
              <span className={classes.metricLabel}>
                <span className={classes.legend} data-tone={m.tone} />
                {m.label}
              </span>
              <span className={classes.metricValue}>{m.value}</span>
              <span className={classes.delta}>
                <ArrowUpRight size={12} />
                {m.delta}
              </span>
            </div>
          ))}
        </div>

        <svg viewBox="0 0 320 100" preserveAspectRatio="none" className={classes.chartSvg}>
          <defs>
            <linearGradient id="gsc-preview-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={classes.fillStart} />
              <stop offset="100%" className={classes.fillEnd} />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="320" y1={y} y2={y} className={classes.gridLine} />
          ))}
          <path d={`${IMPRESSIONS_LINE} L320,100 L0,100 Z`} fill="url(#gsc-preview-fill)" />
          <path d={IMPRESSIONS_LINE} className={classes.lineImpressions} />
          <path d={CLICKS_LINE} className={classes.lineClicks} />
        </svg>
      </div>

      <div className={classes.miniGrid}>
        <div className={classes.panel}>
          <span className={classes.miniHead}>
            <span className={classes.miniIcon} data-tone="good">
              <CheckCircle2 size={14} />
            </span>
            Index status
          </span>
          <Text size="sm" fw={650} mt={10}>
            Page is on Google
          </Text>
          <Text size="xs" c="dimmed" mt={2} truncate>
            /pricing · Submitted and indexed
          </Text>
        </div>

        <div className={classes.panel}>
          <span className={classes.miniHead}>
            <span className={classes.miniIcon} data-tone="info">
              <Target size={14} />
            </span>
            Quick win
          </span>
          <Text size="sm" fw={650} mt={10} truncate>
            website visitor tracking
          </Text>
          <Text size="xs" c="dimmed" mt={2} truncate>
            Position 7.2 · 3.4K impressions
          </Text>
        </div>
      </div>
    </div>
  );
}
