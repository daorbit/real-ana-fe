import { ArrowUpRight, CheckCircle2, TrendingUp } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import classes from "./preview.module.css";

const METRICS = [
  { label: "Clicks", value: "12.4K", delta: "+18%", tone: "clicks" },
  { label: "Impressions", value: "486K", delta: "+32%", tone: "impressions" },
  { label: "CTR", value: "2.6%", delta: "+0.4", tone: "ctr" },
  { label: "Position", value: "8.4", delta: "+2.1", tone: "position" },
];

const LINE = "M0,120 C40,112 70,118 110,100 S170,86 210,90 S270,60 310,58 S370,40 410,34 S470,22 520,14";
const AREA = `${LINE} L520,160 L0,160 Z`;
const SECOND = "M0,138 C40,134 70,138 110,128 S170,120 210,122 S270,104 310,102 S370,92 410,86 S470,78 520,70";

export function SearchConsolePreview() {
  return (
    <div className={classes.stage} aria-hidden>
      <div className={classes.glow} />

      <div className={classes.dashboard}>
        <div className={classes.dashHead}>
          <span className={classes.dashTitle}>Search performance</span>
          <span className={classes.dashRange}>Last 28 days</span>
        </div>

        <div className={classes.metrics}>
          {METRICS.map((m) => (
            <div key={m.label} className={classes.metric} data-tone={m.tone}>
              <span className={classes.metricLabel}>
                <i className={classes.dot} />
                {m.label}
              </span>
              <span className={classes.metricValue}>{m.value}</span>
              <span className={classes.metricDelta}>
                <ArrowUpRight size={11} />
                {m.delta}
              </span>
            </div>
          ))}
        </div>

        <div className={classes.chart}>
          <svg viewBox="0 0 520 160" preserveAspectRatio="none" className={classes.svg}>
            <defs>
              <linearGradient id="gsc-hero-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className={classes.areaTop} />
                <stop offset="100%" className={classes.areaBottom} />
              </linearGradient>
            </defs>
            {[40, 80, 120].map((y) => (
              <line key={y} x1="0" x2="520" y1={y} y2={y} className={classes.grid} />
            ))}
            <path d={AREA} fill="url(#gsc-hero-area)" className={classes.area} />
            <path d={SECOND} className={classes.lineSecond} pathLength={1} />
            <path d={LINE} className={classes.linePrimary} pathLength={1} />
            <circle cx="410" cy="34" r="5" className={classes.point} />
          </svg>
          <div className={classes.tooltip}>
            <span className={classes.tooltipDate}>Sep 21</span>
            <span className={classes.tooltipValue}>1,240 clicks</span>
          </div>
        </div>
      </div>

      <div className={`${classes.float} ${classes.floatQuery}`}>
        <span className={classes.rank}>#1</span>
        <div className={classes.floatText}>
          <span className={classes.floatTitle}>real time analytics</span>
          <span className={classes.floatMeta}>
            <TrendingUp size={11} /> Position 6.2 → 2.1
          </span>
        </div>
      </div>

      <div className={`${classes.float} ${classes.floatOrbit}`}>
        <span className={classes.orbitMark}>
          <OrbitMark size={18} />
        </span>
        <div className={classes.floatText}>
          <span className={classes.floatTitle}>Orbit suggests</span>
          <span className={classes.floatBody}>“pricing” is 3 spots from page 1 — add an FAQ section.</span>
        </div>
      </div>

      <div className={`${classes.float} ${classes.floatIndex}`}>
        <CheckCircle2 size={15} className={classes.indexIcon} />
        <span className={classes.floatTitle}>/pricing is on Google</span>
      </div>
    </div>
  );
}
