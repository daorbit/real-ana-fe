import { Text } from "@mantine/core";
import { ArrowDown, ArrowUp } from "lucide-react";
import classes from "./dataDigestTable.module.css";

/** Mirrors `OrbitDataDigest` on the server — see orbit-data.ts. */
export type DataDigestRow = { key: string; count: number };
export type DataDigestSite = {
  domain: string;
  visitors: number;
  visitorsChangePct: number | null;
  pageviews: number;
  pageviewsChangePct: number | null;
  sessions: number;
  sessionsChangePct: number | null;
  bounceRate: number;
  bounceRateChangePct: number | null;
  live: number;
  topPages: DataDigestRow[];
  topReferrers: DataDigestRow[];
  countries: DataDigestRow[];
  devices: DataDigestRow[];
};
export type DataDigest = { sites: DataDigestSite[]; rangeLabel?: string };

export function isDataDigest(v: unknown): v is DataDigest {
  return Boolean(v) && typeof v === "object" && Array.isArray((v as DataDigest).sites);
}

/** A signed percentage for one line of a plain-text report, or nothing when
 * there is no prior period to compare — mirrors `change()` in orbit-data.ts
 * so the copied report reads the same as the figures Orbit itself was given. */
function changeLine(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return "";
  const rounded = Math.round(pct);
  return ` (${rounded >= 0 ? "+" : ""}${rounded}% vs previous period)`;
}

function rowsLine(label: string, rows: DataDigestRow[]): string {
  if (!rows.length) return "";
  return `${label}: ${rows.map((r) => `${r.key} (${r.count})`).join(", ")}`;
}

/**
 * The same digest as plain text, for the "Copy as report" action — a
 * standalone summary someone can paste into an email or a doc, rather than a
 * chat turn that only makes sense next to the question that produced it.
 */
export function formatDigestAsText(digest: DataDigest): string {
  const range = digest.rangeLabel ?? "the last 7 days";
  return digest.sites
    .map((site) =>
      [
        `${site.domain} — ${range}`,
        `Visitors: ${site.visitors}${changeLine(site.visitorsChangePct)}`,
        `Pageviews: ${site.pageviews}${changeLine(site.pageviewsChangePct)}`,
        `Sessions: ${site.sessions}${changeLine(site.sessionsChangePct)}`,
        `Bounce rate: ${site.bounceRate}%${changeLine(site.bounceRateChangePct)}`,
        `Visitors online now: ${site.live}`,
        rowsLine("Top pages", site.topPages),
        rowsLine("Top referrers", site.topReferrers),
        rowsLine("Countries", site.countries),
        rowsLine("Devices", site.devices),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
}

function Delta({ pct }: { pct: number | null }) {
  if (pct === null || !Number.isFinite(pct)) return null;
  const up = pct >= 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={classes.delta} data-tone={up ? "up" : "down"}>
      <Icon size={11} />
      {Math.abs(Math.round(pct))}%
    </span>
  );
}

function Stat({ label, value, pct }: { label: string; value: string | number; pct: number | null }) {
  return (
    <div className={classes.stat}>
      <Text size="10px" c="dimmed" tt="uppercase" fw={600} lh={1.2}>
        {label}
      </Text>
      <Text size="sm" fw={650} lh={1.3}>
        {value}
      </Text>
      <Delta pct={pct} />
    </div>
  );
}

/**
 * One breakdown (top pages, referrers, …) as a small horizontal bar list —
 * each row's bar scaled against the section's own highest count, so "top
 * pages" and "devices" each fill their own width rather than one dwarfing
 * the other because a site has far more distinct pages than device types.
 */
function TopRows({ label, rows }: { label: string; rows: DataDigestRow[] }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className={classes.breakdown}>
      <Text size="10px" c="dimmed" tt="uppercase" fw={600} mb={6}>
        {label}
      </Text>
      <div className={classes.barList}>
        {rows.map((r) => (
          <div key={r.key} className={classes.barRow}>
            <Text size="11px" className={classes.barKey} lh={1.3}>
              {r.key}
            </Text>
            <div className={classes.barTrack}>
              <div className={classes.barFill} style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
            <Text size="11px" fw={600} c="dimmed" className={classes.barCount}>
              {r.count}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The table view of an answer's `dataDigest` — the same 7-day figures the
 * model read as prose, shown as a scannable card instead of left to be read
 * back out of the sentence above it.
 *
 * Renders nothing for anything that isn't the expected shape, so a caller
 * can pass an answer's `dataDigest` through unconditionally.
 */
/**
 * When a stored digest was taken, as a short caption.
 *
 * Omitted for anything from the last few minutes: on the answer someone is
 * reading right now, "as of today" is noise. Beyond that it matters, because
 * these are the figures the prose above quotes and they are not today's.
 */
function takenAt(iso?: string): string | null {
  if (!iso) return null;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  if (Date.now() - at.getTime() < 5 * 60_000) return null;

  return `as of ${at.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: at.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  })}`;
}

export function DataDigestTable({
  digest,
  /** ISO time the snapshot was taken — set on a restored turn, not a live one. */
  takenAtIso,
}: {
  digest: unknown;
  takenAtIso?: string;
}) {
  if (!isDataDigest(digest) || !digest.sites.length) return null;

  const stamp = takenAt(takenAtIso);
  const range = digest.rangeLabel ?? "the last 7 days";

  return (
    <div className={classes.wrap}>
      {digest.sites.map((site) => (
        <div key={site.domain} className={classes.card}>
          <Text size="xs" fw={600} c="dimmed" mb={8}>
            {site.domain} · {range}
            {stamp ? <Text span c="dimmed" fw={400}> · {stamp}</Text> : null}
          </Text>
          <div className={classes.statRow}>
            <Stat label="Visitors" value={site.visitors} pct={site.visitorsChangePct} />
            <Stat label="Pageviews" value={site.pageviews} pct={site.pageviewsChangePct} />
            <Stat label="Sessions" value={site.sessions} pct={site.sessionsChangePct} />
            <Stat label="Bounce" value={`${site.bounceRate}%`} pct={site.bounceRateChangePct} />
            <Stat label="Online now" value={site.live} pct={null} />
          </div>
          {(site.topPages.length > 0 ||
            site.topReferrers.length > 0 ||
            site.countries.length > 0 ||
            site.devices.length > 0) && (
            <div className={classes.breakdowns}>
              <TopRows label="Top pages" rows={site.topPages} />
              <TopRows label="Top referrers" rows={site.topReferrers} />
              <TopRows label="Countries" rows={site.countries} />
              <TopRows label="Devices" rows={site.devices} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
