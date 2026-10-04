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

const CHECKS = [
  { label: "HTTPS", ok: true },
  { label: "robots.txt", ok: true },
  { label: "sitemap.xml", ok: true },
  { label: "Canonical tag", ok: false },
];

export function ChecksPreview() {
  return (
    <div className={classes.checks}>
      {CHECKS.map((c) => (
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
