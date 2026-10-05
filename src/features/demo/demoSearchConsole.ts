import type {
  SearchConsoleStatus, SearchPerformance, SearchBreakdown, SearchBreakdownDimension,
  SearchBreakdownRow, SearchInsights, SearchInsightRow, SearchHourly, SearchSitemaps,
  SearchInspection, SearchDrilldown, SearchMetrics, SearchType,
} from "@/shared/types";
import { DEMO_SITE_ID } from "@/features/demo/demoData";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEMO_PROPERTY_URL = "https://acme.example/";

const now = Date.now();
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const PAGES = ["/", "/pricing", "/docs", "/blog/launch", "/features", "/about", "/docs/api", "/changelog"];
const QUERIES = [
  "acme", "acme pricing", "acme vs rival", "developer deploy tool", "acme docs",
  "acme api reference", "best deployment tool 2026", "acme changelog",
];
const COUNTRIES = ["USA", "GBR", "IND", "DEU", "CAN"];
const DEVICES = ["DESKTOP", "MOBILE", "TABLET"];

function metrics(rand: () => number, scale: number): SearchMetrics {
  const impressions = Math.round(scale * (0.7 + rand() * 0.6));
  const ctr = 0.02 + rand() * 0.07;
  const clicks = Math.max(0, Math.round(impressions * ctr));
  const position = 3 + rand() * 18;
  return { clicks, impressions, ctr: Number(ctr.toFixed(4)), position: Number(position.toFixed(1)) };
}

/** Largest-first split of a total across labels, same decaying-share shape used elsewhere in demo data. */
function rankedRows(labels: string[], seed: number, total: number): SearchBreakdownRow[] {
  const rand = rng(seed);
  const raw = labels.map((_, i) => Math.pow(0.65, i));
  const sum = raw.reduce((a, b) => a + b, 0);
  return labels.map((key, i) => {
    const m = metrics(rand, (raw[i] / sum) * total);
    const previousClicks = Math.max(0, Math.round(m.clicks / (1 + (rand() - 0.4) * 0.3)));
    const previousPosition = Number((m.position + (rand() - 0.5) * 3).toFixed(1));
    return { key, ...m, previousClicks, previousPosition };
  });
}

function dailySeries(days: number, seed: number, dailyTotal: number) {
  const rand = rng(seed);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now - (days - 1 - i) * DAY).toISOString().slice(0, 10);
    const trend = 1 + (i / days) * 0.3;
    const m = metrics(rand, dailyTotal * trend);
    return { date, ...m };
  });
}

export function demoSearchConsoleStatus(siteId: string = DEMO_SITE_ID): SearchConsoleStatus {
  return {
    configured: true,
    connected: true,
    connection: {
      googleEmail: "demo@acme.example",
      status: "active",
      statusMessage: "",
      connectedAt: iso(60 * DAY),
    },
    links: [{ siteId, propertyUrl: DEMO_PROPERTY_URL }],
  };
}

export function demoSearchPerformance(days = 28, type: SearchType = "web"): SearchPerformance {
  const daily = dailySeries(days, 0x5e1, 420);
  const totals = daily.reduce(
    (acc, d) => ({
      clicks: acc.clicks + d.clicks,
      impressions: acc.impressions + d.impressions,
      ctr: acc.ctr,
      position: acc.position,
    }),
    { clicks: 0, impressions: 0, ctr: 0, position: 0 },
  );
  totals.ctr = totals.impressions ? Number((totals.clicks / totals.impressions).toFixed(4)) : 0;
  totals.position = Number((daily.reduce((s, d) => s + d.position, 0) / daily.length).toFixed(1));

  const previous = metrics(rng(0x5e2), totals.clicks / 0.88);

  return {
    propertyUrl: DEMO_PROPERTY_URL,
    days,
    type,
    startDate: daily[0].date,
    endDate: daily[daily.length - 1].date,
    totals,
    previous,
    daily,
    queries: rankedRows(QUERIES, 0x5e3, totals.clicks).map((r) => ({ ...r, query: r.key })),
    pages: rankedRows(PAGES, 0x5e4, totals.clicks).map((r) => ({ ...r, page: `https://acme.example${r.key}`, views: r.clicks * 3 })),
    fetchedAt: iso(20 * 60_000),
  };
}

const DIMENSION_LABELS: Record<SearchBreakdownDimension, string[]> = {
  query: QUERIES,
  page: PAGES,
  country: COUNTRIES,
  device: DEVICES,
};

export function demoSearchBreakdown(dimension: SearchBreakdownDimension, days = 28): SearchBreakdown {
  const labels = DIMENSION_LABELS[dimension];
  const rows = rankedRows(labels, 0x5e5 + days, 420 * days).map((r) =>
    dimension === "page" ? { ...r, key: `https://acme.example${r.key}`, views: r.clicks * 3 } : r,
  );

  return {
    dimension,
    days,
    type: "web",
    startDate: new Date(now - days * DAY).toISOString().slice(0, 10),
    endDate: new Date(now).toISOString().slice(0, 10),
    rows,
    total: rows.length,
    totalAll: rows.length,
    page: 1,
    pageSize: Math.max(25, rows.length),
    truncated: false,
    limitedTo: null,
    fetchedAt: iso(20 * 60_000),
  };
}

export function demoSearchInsights(days = 28): SearchInsights {
  const asInsightRow = (r: SearchBreakdownRow, missedClicks?: number): SearchInsightRow => ({ ...r, missedClicks });

  const quickWinRand = rng(0x5e6 + 1);
  const quickWins = rankedRows(["acme vs rival", "acme pricing", "developer deploy tool"], 0x5e6, 180)
    .map((r) => ({ ...r, position: Number((10 + quickWinRand() * 4).toFixed(1)) }));
  const lowCtr = rankedRows(["acme docs", "acme changelog"], 0x5e7, 90);
  const rising = rankedRows(["acme api reference", "acme"], 0x5e8, 140);
  const falling = rankedRows(["best deployment tool 2026"], 0x5e9, 60);

  return {
    days,
    type: "web",
    positionBands: [
      { band: "1-3", queries: 3, clicks: 620, impressions: 4100, netMoved: 1 },
      { band: "4-10", queries: 9, clicks: 410, impressions: 9800, netMoved: 2 },
      { band: "11-20", queries: 14, clicks: 120, impressions: 12_400, netMoved: -1 },
      { band: "21+", queries: 22, clicks: 38, impressions: 15_600, netMoved: 0 },
    ],
    questionQueries: rankedRows(["how does acme deploy work", "is acme free", "what is acme used for"], 0x5ea, 70).map((r) => asInsightRow(r)),
    quickWins: quickWins.map((r) => asInsightRow(r, Math.round(r.impressions * 0.1))),
    lowCtr: lowCtr.map((r) => asInsightRow(r, Math.round(r.impressions * 0.05))),
    risingQueries: rising.map((r) => asInsightRow(r)),
    fallingQueries: falling.map((r) => asInsightRow(r)),
    risingPages: rankedRows(["/pricing", "/docs/api"], 0x5eb, 120).map((r) => asInsightRow(r)),
    fallingPages: rankedRows(["/changelog"], 0x5ec, 40).map((r) => asInsightRow(r)),
    newQueries: rankedRows(["acme api reference"], 0x5ed, 50).map((r) => asInsightRow(r)),
    lostQueries: [{ key: "acme alternative", previousClicks: 24, previousImpressions: 640 }],
    counts: { queries: QUERIES.length, pages: PAGES.length, newQueries: 1, lostQueries: 1, questionQueries: 3 },
    limited: false,
    fetchedAt: iso(20 * 60_000),
  };
}

export function demoSearchHourly(type: SearchType = "web"): SearchHourly {
  const rand = rng(0x5ee);
  const hours = Array.from({ length: 48 }, (_, i) => {
    const hour = new Date(now - (47 - i) * 3_600_000).toISOString();
    const workHour = new Date(now - (47 - i) * 3_600_000).getUTCHours();
    const daytime = workHour >= 8 && workHour <= 20 ? 1 : 0.35;
    const m = metrics(rand, 18 * daytime);
    return { hour, ...m };
  });
  const last24 = hours.slice(24);
  const prev24 = hours.slice(0, 24);
  const sum = (list: typeof hours) => list.reduce((a, b) => ({ clicks: a.clicks + b.clicks, impressions: a.impressions + b.impressions }), { clicks: 0, impressions: 0 });
  const l = sum(last24);
  const p = sum(prev24);

  return {
    type,
    hours,
    last24: { clicks: l.clicks, impressions: l.impressions, ctr: l.impressions ? Number((l.clicks / l.impressions).toFixed(4)) : 0, position: 8.4 },
    previous24: { clicks: p.clicks, impressions: p.impressions, ctr: p.impressions ? Number((p.clicks / p.impressions).toFixed(4)) : 0, position: 8.9 },
    fetchedAt: iso(10 * 60_000),
  };
}

export function demoSearchSitemaps(): SearchSitemaps {
  return {
    sitemaps: [
      {
        path: "https://acme.example/sitemap.xml", type: "sitemap", isIndex: true, isPending: false,
        lastSubmitted: iso(20 * DAY), lastDownloaded: iso(1 * DAY), errors: 0, warnings: 0, submitted: 24, indexed: 22,
      },
      {
        path: "https://acme.example/sitemap-blog.xml", type: "sitemap", isIndex: false, isPending: false,
        lastSubmitted: iso(20 * DAY), lastDownloaded: iso(1 * DAY), errors: 0, warnings: 1, submitted: 9, indexed: 8,
      },
    ],
    fetchedAt: iso(10 * 60_000),
    access: { canSubmit: true, blockedBy: null },
  };
}

export function demoSearchInspection(url: string): SearchInspection {
  return {
    url,
    indexStatus: "PASS",
    verdict: "PASS",
    coverageState: "Submitted and indexed",
    pageFetchState: "SUCCESSFUL",
    robotsTxtState: "ALLOWED",
    lastCrawled: iso(2 * DAY),
    issues: [],
    googleCanonical: url,
    userCanonical: url,
    crawledAs: "GOOGLEBOT_SMARTPHONE",
    sitemaps: ["https://acme.example/sitemap.xml"],
    referringUrls: ["https://acme.example/"],
    richResults: [{ type: "FAQPage", items: 1, issues: [] }],
    fetchedAt: iso(10 * 60_000),
  };
}

export function demoSearchDrilldown(
  dimension: "query" | "page",
  value: string,
  days = 28,
): SearchDrilldown {
  const drilldownRand = rng(0x5ef + 1);
  const daily = dailySeries(days, 0x5ef, 60).map((d) => ({ ...d, position: Number((6 + drilldownRand() * 4).toFixed(1)) }));
  const totals = daily.reduce(
    (acc, d) => ({ clicks: acc.clicks + d.clicks, impressions: acc.impressions + d.impressions, ctr: acc.ctr, position: acc.position }),
    { clicks: 0, impressions: 0, ctr: 0, position: 0 },
  );
  totals.ctr = totals.impressions ? Number((totals.clicks / totals.impressions).toFixed(4)) : 0;
  totals.position = Number((daily.reduce((s, d) => s + d.position, 0) / daily.length).toFixed(1));
  const previous = metrics(rng(0x5f0), totals.clicks / 0.9);

  const related = dimension === "query"
    ? rankedRows(PAGES, 0x5f1, totals.clicks).map((r) => ({ ...r, key: `https://acme.example${r.key}` }))
    : rankedRows(QUERIES, 0x5f1, totals.clicks);

  return {
    dimension,
    value,
    days,
    type: "web",
    totals,
    previous,
    daily,
    related,
    views: dimension === "page"
      ? { total: totals.clicks * 3, previous: previous.clicks * 3, daily: daily.map((d) => ({ date: d.date, views: d.clicks * 3 })) }
      : undefined,
    fetchedAt: iso(10 * 60_000),
  };
}
