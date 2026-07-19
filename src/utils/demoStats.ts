import type { Stats } from "../types";

/**
 * A believable populated dashboard, generated rather than hand-written.
 *
 * This exists so an empty account can be shown as it will look once traffic
 * arrives — every widget renders with plausible shapes instead of a page of
 * "No data yet" panels. It is display-only: nothing here is ever sent to the
 * server, counted, or persisted.
 *
 * The numbers are deterministic. A fixed seed means the demo looks the same on
 * every render and every reload, so switching a range doesn't reshuffle the
 * whole page and a screenshot taken today matches one taken tomorrow.
 */

/** Small deterministic PRNG (mulberry32) — no dependency, stable across runs. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distribute a total across labels on a decaying curve, largest first. */
function ranked(labels: string[], total: number, decay = 0.62): { key: string; count: number }[] {
  const raw = labels.map((_, i) => Math.pow(decay, i));
  const sum = raw.reduce((a, b) => a + b, 0);
  return labels.map((key, i) => ({
    key,
    count: Math.max(1, Math.round((raw[i] / sum) * total)),
  }));
}

const PAGES = ["/", "/pricing", "/docs", "/blog/launch", "/features", "/about", "/docs/api", "/changelog"];
const REFERRERS = ["(direct)", "google.com", "news.ycombinator.com", "x.com", "reddit.com", "linkedin.com", "github.com"];
const COUNTRIES = ["US", "IN", "GB", "DE", "CA", "FR", "AU", "NL", "BR", "JP"];
const DEVICES = ["Desktop", "Mobile", "Tablet"];
const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Opera"];
const SYSTEMS = ["Windows", "macOS", "iOS", "Android", "Linux"];
const LANGUAGES = ["en-US", "en-GB", "de-DE", "fr-FR", "pt-BR", "ja-JP"];
const SCREENS = ["1920×1080", "1440×900", "390×844", "2560×1440", "768×1024"];
const CHANNELS = ["Organic Search", "Direct", "Referral", "Social", "Paid", "Email"];
const UTM_SOURCES = ["newsletter", "producthunt", "twitter", "google", "partner"];
const UTM_CAMPAIGNS = ["launch-week", "spring-sale", "docs-refresh", "webinar"];

/** How many buckets a range is drawn with, and how each is labelled. */
function axis(range: string): { points: number; label: (i: number, n: number) => string } {
  if (range === "24h") {
    return {
      points: 24,
      label: (i, n) => {
        const d = new Date();
        d.setMinutes(0, 0, 0);
        d.setHours(d.getHours() - (n - 1 - i));
        return `${String(d.getHours()).padStart(2, "0")}:00`;
      },
    };
  }
  const points = range === "7d" ? 7 : range === "12m" ? 12 : 30;
  return {
    points,
    label: (i, n) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (n - 1 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    },
  };
}

/**
 * Build a full stats payload for a range.
 *
 * Totals are derived from the timeseries rather than picked independently, so
 * the headline numbers actually agree with the chart under them — a mismatch
 * there is the first thing that gives fake data away.
 */
export function demoStats(range: string): Stats {
  const rand = rng(0x51a7);
  const { points, label } = axis(range);

  // A gentle upward trend with a weekly rhythm, so the chart reads as traffic
  // rather than noise.
  const timeseries = Array.from({ length: points }, (_, i) => {
    const trend = 1 + (i / points) * 0.45;
    const weekly = 1 + Math.sin((i / points) * Math.PI * 2) * 0.18;
    const jitter = 0.85 + rand() * 0.3;
    const views = Math.round(120 * trend * weekly * jitter);
    return {
      bucket: label(i, points),
      views,
      visitors: Math.round(views * (0.62 + rand() * 0.08)),
    };
  });

  const pageviews = timeseries.reduce((a, b) => a + b.views, 0);
  const visitors = timeseries.reduce((a, b) => a + b.visitors, 0);
  const sessions = Math.round(visitors * 1.18);

  const heatmap = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      // Weekday office hours are busiest; nights and weekends taper off.
      const workday = day >= 1 && day <= 5 ? 1 : 0.45;
      const daytime = hour >= 8 && hour <= 20 ? 1 : 0.25;
      return {
        day,
        hour,
        count: Math.round(pageviews * 0.006 * workday * daytime * (0.6 + rand() * 0.8)),
      };
    }),
  ).flat();

  return {
    range,

    pageviews,
    visitors,
    sessions,
    live: 12 + Math.round(rand() * 20),

    bounceRate: 41,
    avgSessionMs: 168_000,
    avgTimeOnPageMs: 54_000,
    pagesPerSession: 2.4,

    deltas: {
      pageviews: 12.4,
      visitors: 9.1,
      sessions: 7.8,
      bounceRate: -3.2,
      avgSessionMs: 6.5,
      pagesPerSession: 2.1,
    },

    topPages: ranked(PAGES, pageviews),
    entryPages: ranked([PAGES[0], PAGES[3], PAGES[1], PAGES[2], PAGES[5]], sessions),
    exitPages: ranked([PAGES[1], PAGES[0], PAGES[2], PAGES[6], PAGES[4]], Math.round(sessions * 0.82)),
    topReferrers: ranked(REFERRERS, sessions),
    devices: ranked(DEVICES, visitors, 0.45),
    browsers: ranked(BROWSERS, visitors),
    operatingSystems: ranked(SYSTEMS, visitors),
    countries: ranked(COUNTRIES, visitors),
    languages: ranked(LANGUAGES, visitors),
    screenSizes: ranked(SCREENS, visitors),
    utmSources: ranked(UTM_SOURCES, Math.round(sessions * 0.22)),
    utmCampaigns: ranked(UTM_CAMPAIGNS, Math.round(sessions * 0.18)),
    channels: ranked(CHANNELS, sessions, 0.7),

    clicks: [
      { key: "Start free trial", count: 412, path: "/", href: "/signup", tag: "a" },
      { key: "View pricing", count: 288, path: "/", href: "/pricing", tag: "a" },
      { key: "Read the docs", count: 196, path: "/features", href: "/docs", tag: "a" },
      { key: "Book a demo", count: 134, path: "/pricing", href: "/demo", tag: "button" },
      { key: "Copy snippet", count: 97, path: "/docs", tag: "button" },
    ],
    clickCount: 1127,

    scrollDepth: [
      { key: "/", count: 980, avgDepth: 72, completionRate: 41 },
      { key: "/pricing", count: 610, avgDepth: 84, completionRate: 58 },
      { key: "/docs", count: 430, avgDepth: 66, completionRate: 33 },
      { key: "/blog/launch", count: 305, avgDepth: 91, completionRate: 67 },
    ],

    heatmap,

    landingPages: [
      { key: "/", count: 1240, bounceRate: 38, pagesPerSession: 3.1 },
      { key: "/blog/launch", count: 486, bounceRate: 52, pagesPerSession: 1.9 },
      { key: "/pricing", count: 372, bounceRate: 29, pagesPerSession: 3.8 },
      { key: "/docs", count: 214, bounceRate: 34, pagesPerSession: 2.7 },
    ],

    customEvents: [
      { key: "signup", count: 148, visitors: 142, conversionRate: 4.1, revenue: 0 },
      { key: "purchase", count: 63, visitors: 61, conversionRate: 1.8, revenue: 5_940 },
      { key: "trial_started", count: 219, visitors: 205, conversionRate: 5.9, revenue: 0 },
      { key: "docs_search", count: 512, visitors: 288, conversionRate: 8.3, revenue: 0 },
    ],
    totalRevenue: 5_940,

    outboundClicks: [
      { key: "github.com/quantalog", count: 184, kind: "outbound" },
      { key: "status.quantalog.com", count: 92, kind: "outbound" },
      { key: "/press-kit.zip", count: 47, kind: "download" },
      { key: "/whitepaper.pdf", count: 38, kind: "download" },
    ],

    errors: [
      { key: "TypeError: t.map is not a function", count: 23, path: "/pricing", lastSeen: new Date(Date.now() - 36e5).toISOString() },
      { key: "NetworkError when fetching resource", count: 11, path: "/docs", lastSeen: new Date(Date.now() - 9e6).toISOString() },
      { key: "ResizeObserver loop limit exceeded", count: 7, path: "/", lastSeen: new Date(Date.now() - 2.4e7).toISOString() },
    ],

    goals: [
      { id: "demo-goal-1", name: "Signup", kind: "event", match: "signup", conversions: 142, conversionRate: 4.1 },
      { id: "demo-goal-2", name: "Reached pricing", kind: "page", match: "/pricing", conversions: 486, conversionRate: 14.0 },
      { id: "demo-goal-3", name: "Purchase", kind: "event", match: "purchase", conversions: 61, conversionRate: 1.8 },
    ],

    livePages: ranked([PAGES[0], PAGES[1], PAGES[2], PAGES[3]], 34, 0.5),

    timeseries,

    siteCount: 3,
  };
}
