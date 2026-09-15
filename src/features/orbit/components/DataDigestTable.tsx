import { Table, Text } from "@mantine/core";
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
export type DataDigest = { sites: DataDigestSite[] };

function isDataDigest(v: unknown): v is DataDigest {
  return Boolean(v) && typeof v === "object" && Array.isArray((v as DataDigest).sites);
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

function TopRows({ label, rows }: { label: string; rows: DataDigestRow[] }) {
  if (!rows.length) return null;
  return (
    <div className={classes.breakdown}>
      <Text size="10px" c="dimmed" tt="uppercase" fw={600} mb={4}>
        {label}
      </Text>
      <Table withRowBorders={false} verticalSpacing={2} horizontalSpacing={8}>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.key}>
              <Table.Td className={classes.rowKey}>{r.key}</Table.Td>
              <Table.Td className={classes.rowCount}>{r.count}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
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
export function DataDigestTable({ digest }: { digest: unknown }) {
  if (!isDataDigest(digest) || !digest.sites.length) return null;

  return (
    <div className={classes.wrap}>
      {digest.sites.map((site) => (
        <div key={site.domain} className={classes.card}>
          <Text size="xs" fw={600} c="dimmed" mb={8}>
            {site.domain} · last 7 days
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
