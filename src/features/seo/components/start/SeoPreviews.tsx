import { AlertTriangle, Check } from "lucide-react";
import classes from "./SeoStart.module.css";

const SCORE = 92;
const RING = 2 * Math.PI * 26;

const LIGHTHOUSE = [
  { label: "Performance", value: 88 },
  { label: "Accessibility", value: 96 },
  { label: "Best practices", value: 100 },
  { label: "SEO", value: 92 },
];

export function ScorePreview() {
  return (
    <div className={classes.scorePreview}>
      <svg viewBox="0 0 64 64" className={classes.ring} aria-hidden>
        <circle cx="32" cy="32" r="26" className={classes.ringTrack} />
        <circle
          cx="32"
          cy="32"
          r="26"
          className={classes.ringValue}
          strokeDasharray={`${(SCORE / 100) * RING} ${RING}`}
        />
        <text x="32" y="37" textAnchor="middle" className={classes.ringText}>{SCORE}</text>
      </svg>
      <div className={classes.bars}>
        {LIGHTHOUSE.map((row) => (
          <div key={row.label} className={classes.barRow}>
            <span className={classes.barLabel}>{row.label}</span>
            <span className={classes.barTrack}>
              <span className={classes.barFill} data-value={row.value} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SnippetPreview({ domain }: { domain: string }) {
  return (
    <div className={classes.snippet}>
      <div className={classes.snippetSite}>
        <span className={classes.snippetFavicon} />
        <span className={classes.snippetDomain}>{domain || "yoursite.com"}</span>
      </div>
      <div className={classes.snippetTitle}>Your page title, as Google shows it</div>
      <span className={classes.line} data-width="full" />
      <span className={classes.line} data-width="most" />
    </div>
  );
}

const HEADINGS = [
  { tag: "H1", depth: 0, width: "most" },
  { tag: "H2", depth: 1, width: "half" },
  { tag: "H3", depth: 2, width: "third" },
  { tag: "H2", depth: 1, width: "half" },
];

export function HeadingsPreview() {
  return (
    <div className={classes.headings}>
      {HEADINGS.map((h, i) => (
        <div key={i} className={classes.headingRow} data-depth={h.depth}>
          <span className={classes.headingTag}>{h.tag}</span>
          <span className={classes.line} data-width={h.width} />
        </div>
      ))}
    </div>
  );
}

export type PreviewCheck = { label: string; ok: boolean };

const CHECKS: PreviewCheck[] = [
  { label: "HTTPS", ok: true },
  { label: "robots.txt", ok: true },
  { label: "sitemap.xml", ok: true },
  { label: "Canonical tag", ok: false },
];

const ISSUES = [
  { severity: "critical", width: "most" },
  { severity: "warning", width: "half" },
  { severity: "warning", width: "most" },
  { severity: "info", width: "third" },
] as const;

export function IssuesPreview() {
  return (
    <div className={classes.checks}>
      {ISSUES.map((issue, i) => (
        <div key={i} className={classes.checkRow}>
          <span className={classes.severityDot} data-severity={issue.severity} />
          <span className={classes.line} data-width={issue.width} />
        </div>
      ))}
    </div>
  );
}

const VITALS = [
  { label: "LCP", value: "1.8 s", fill: "96" },
  { label: "INP", value: "120 ms", fill: "92" },
  { label: "CLS", value: "0.04", fill: "100" },
];

export function VitalsPreview() {
  return (
    <div className={classes.bars}>
      {VITALS.map((row) => (
        <div key={row.label} className={classes.vitalRow}>
          <span className={classes.barLabel}>{row.label}</span>
          <span className={classes.barTrack}>
            <span className={classes.barFill} data-value={row.fill} />
          </span>
          <span className={classes.vitalValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ChecksPreview({ items = CHECKS }: { items?: PreviewCheck[] }) {
  return (
    <div className={classes.checks}>
      {items.map((c) => (
        <div key={c.label} className={classes.checkRow}>
          <span className={classes.checkIcon} data-ok={c.ok || undefined}>
            {c.ok ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} strokeWidth={2.5} />}
          </span>
          <span className={classes.checkLabel}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
