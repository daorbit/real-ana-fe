import { AlertTriangle, Check } from "lucide-react";
import classes from "./SearchStart.module.css";

const BARS = 14;

export function ClicksPreview() {
  return (
    <div className={classes.clicks}>
      <div className={classes.stats}>
        <span className={classes.stat}>
          <span className={classes.statLabel}>Clicks</span>
          <span className={classes.statValue}>1.2K</span>
        </span>
        <span className={classes.stat}>
          <span className={classes.statLabel}>Impressions</span>
          <span className={classes.statValue} data-muted>38K</span>
        </span>
      </div>
      <div className={classes.chart}>
        {Array.from({ length: BARS }, (_, i) => (
          <span key={i} className={classes.bar} />
        ))}
      </div>
    </div>
  );
}

const QUERIES = [
  { width: "most", position: "2.4" },
  { width: "half", position: "5.1" },
  { width: "third", position: "8.7" },
  { width: "half", position: "12" },
];

export function QueriesPreview() {
  return (
    <div className={classes.rows}>
      {QUERIES.map((q, i) => (
        <div key={i} className={classes.row}>
          <span className={classes.line} data-width={q.width} />
          <span className={classes.position}>#{q.position}</span>
        </div>
      ))}
    </div>
  );
}

const PAGES = [
  { path: "/", share: "full" },
  { path: "/pricing", share: "most" },
  { path: "/blog", share: "half" },
  { path: "/contact", share: "third" },
];

export function PagesPreview() {
  return (
    <div className={classes.rows}>
      {PAGES.map((p) => (
        <div key={p.path} className={classes.pageRow}>
          <span className={classes.pagePath}>{p.path}</span>
          <span className={classes.meter}>
            <span className={classes.meterFill} data-width={p.share} />
          </span>
        </div>
      ))}
    </div>
  );
}

const INDEX = [
  { label: "Sitemap submitted", ok: true },
  { label: "128 pages indexed", ok: true },
  { label: "Last crawled today", ok: true },
  { label: "3 pages not indexed", ok: false },
];

export function IndexPreview() {
  return (
    <div className={classes.rows}>
      {INDEX.map((c) => (
        <div key={c.label} className={classes.check}>
          <span className={classes.checkIcon} data-ok={c.ok || undefined}>
            {c.ok ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} strokeWidth={2.5} />}
          </span>
          <span className={classes.checkLabel}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
