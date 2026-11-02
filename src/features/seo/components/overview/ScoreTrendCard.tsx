import type { SeoReportSummary } from "@/shared/types";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import classes from "./overviewCards.module.css";

const W = 520;
const H = 150;
const PAD_X = 16;
const TOP = 20;
const BOTTOM = 130;
const MAX_POINTS = 8;

function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function ScoreTrendCard({ history, current }: { history: SeoReportSummary[]; current: number }) {
  const runs = [...history].slice(0, MAX_POINTS).reverse();
  const points = runs.length >= 2 ? runs.map((h) => ({ score: h.score, label: shortDate(h.createdAt) })) : [
    { score: runs[0]?.score ?? current, label: runs[0] ? shortDate(runs[0].createdAt) : "" },
    { score: current, label: "Now" },
  ];

  const scores = points.map((p) => p.score);
  const min = Math.max(0, Math.min(...scores) - 10);
  const max = Math.min(100, Math.max(...scores) + 5);
  const span = Math.max(1, max - min);
  const step = (W - PAD_X * 2) / (points.length - 1);
  const xy = points.map((p, i) => ({
    ...p,
    x: PAD_X + i * step,
    y: BOTTOM - ((p.score - min) / span) * (BOTTOM - TOP),
  }));
  const line = xy.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const delta = points[points.length - 1].score - points[0].score;
  const dir = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const labels = xy.length <= 6 ? xy : [xy[0], xy[Math.floor(xy.length / 2)], xy[xy.length - 1]];

  return (
    <SeoCard
      className="col-6"
      title="Score over time"
      right={
        <span className={classes.delta} data-dir={dir}>
          {delta > 0 ? "+" : ""}
          {delta} over {points.length} audits
        </span>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={classes.chart}
        role="img"
        aria-label={`Score went from ${points[0].score} to ${points[points.length - 1].score} over the last ${points.length} audits`}
      >
        <line x1={0} y1={TOP} x2={W} y2={TOP} className={classes.gridLine} />
        <line x1={0} y1={(TOP + BOTTOM) / 2} x2={W} y2={(TOP + BOTTOM) / 2} className={classes.gridLine} />
        <line x1={0} y1={BOTTOM} x2={W} y2={BOTTOM} className={classes.gridLine} />
        <path d={line} className={classes.trendLine} />
        {xy.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4.5} className={classes.trendDot}>
            <title>{`${p.label}: ${p.score}`}</title>
          </circle>
        ))}
      </svg>
      <div className={classes.chartLabels}>
        {labels.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </SeoCard>
  );
}
