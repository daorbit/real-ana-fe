import type { HeatCell } from "@/shared/types";
import type { BioDailyPoint, BioLinkClicks, BioPageInput, BioPageStats, BioPageStatsDetail, BioStatRow } from "@/features/bio/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const SOURCE_WEIGHTS: Record<string, number> = {
  instagram: 38,
  direct: 16,
  whatsapp: 12,
  youtube: 10,
  x: 7,
  qr: 6,
  tiktok: 5,
  facebook: 3,
  linkedin: 2,
  other: 1,
};
const REFERRER_WEIGHTS: Record<string, number> = {
  "instagram.com": 41,
  "youtube.com": 14,
  "t.co": 9,
  "facebook.com": 6,
  "linkedin.com": 4,
  "google.com": 4,
  "threads.net": 2,
};
const COUNTRY_WEIGHTS: Record<string, number> = { IN: 61, US: 11, AE: 7, GB: 6, CA: 4, SG: 4, AU: 3, DE: 2, NP: 2 };
const CITY_WEIGHTS: Record<string, number> = {
  "IN:Mumbai": 19,
  "IN:Delhi": 14,
  "IN:Bengaluru": 11,
  "IN:Pune": 8,
  "IN:Hyderabad": 6,
  "AE:Dubai": 6,
  "GB:London": 5,
  "US:New York": 5,
  "SG:Singapore": 3,
};
const DEVICE_WEIGHTS: Record<string, number> = { mobile: 86, desktop: 11, tablet: 3 };
const BROWSER_WEIGHTS: Record<string, number> = {
  "Instagram in-app": 34,
  Chrome: 31,
  Safari: 22,
  "Samsung Internet": 6,
  "Facebook in-app": 4,
  Firefox: 2,
};
const OS_WEIGHTS: Record<string, number> = { Android: 58, iOS: 31, Windows: 7, macOS: 4 };
const LANGUAGE_WEIGHTS: Record<string, number> = { "en-IN": 46, "hi-IN": 21, "en-US": 14, "en-GB": 7, "mr-IN": 5, "ta-IN": 3 };
const HOUR_SHAPE = [2, 1, 1, 1, 1, 2, 4, 6, 8, 9, 9, 10, 11, 10, 10, 10, 11, 13, 15, 17, 19, 18, 13, 7];

export type BioHitTotals = {
  views: number;
  clicks: number;
  links: Record<string, number>;
  sources: Record<string, number>;
  devices: Record<string, number>;
};

export const NO_HITS: BioHitTotals = { views: 0, clicks: 0, links: {}, sources: {}, devices: {} };

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function split(total: number, weights: Record<string, number>, rand: () => number): Record<string, number> {
  const jittered = Object.entries(weights).map(([key, w]) => [key, w * (0.75 + rand() * 0.5)] as const);
  const sum = jittered.reduce((acc, [, w]) => acc + w, 0);
  return Object.fromEntries(jittered.map(([key, w]) => [key, Math.round((total * w) / sum)]));
}

function merge(base: Record<string, number>, extra: Record<string, number> = {}): BioStatRow[] {
  const all: Record<string, number> = { ...base };
  for (const [key, count] of Object.entries(extra)) all[key] = (all[key] ?? 0) + count;
  return Object.entries(all)
    .map(([key, count]) => ({ key, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function trackedLinks(page: BioPageInput): { id: string; label: string }[] {
  if (page.kind === "release") {
    return (page.release?.rows ?? []).filter((row) => row.enabled).map((row) => ({ id: row.id, label: row.name }));
  }
  return page.links.filter((link) => link.enabled).map((link) => ({ id: link.id, label: link.label }));
}

function dailySeries(seed: string, days: number, scale: number): BioDailyPoint[] {
  const rand = seeded(`${seed}:daily`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const points: BioDailyPoint[] = [];
  for (let i = 730 - 1; i >= 0; i -= 1) {
    const date = new Date(today.getTime() - i * DAY_MS);
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.25 : 1;
    const views = scale ? Math.round(scale * (0.55 + rand() * 0.9) * weekend) : 0;
    const visitors = Math.round(views * (0.72 + rand() * 0.1));
    const clicks = Math.round(views * (0.28 + rand() * 0.16));
    points.push({ date: date.toISOString().slice(0, 10), views, visitors, clicks });
  }
  return points.slice(-days * 2);
}

function linkSplit(seed: string, links: { id: string; label: string }[], clicks: number): Record<string, number> {
  const rand = seeded(`${seed}:links`);
  const weights = Object.fromEntries(links.map((link, i) => [link.id, (1 / Math.pow(i + 1, 0.8)) * (0.7 + rand() * 0.6)]));
  return links.length ? split(clicks, weights, rand) : {};
}

function heatmap(seed: string, views: number): HeatCell[] {
  if (!views) return [];
  const rand = seeded(`${seed}:heat`);
  const weights: Record<string, number> = {};
  for (let day = 0; day < 7; day += 1) {
    const weekend = day === 0 || day === 6 ? 1.3 : 1;
    HOUR_SHAPE.forEach((w, hour) => {
      weights[`${day}-${hour}`] = w * weekend;
    });
  }
  return Object.entries(split(views, weights, rand)).map(([key, count]) => {
    const [day, hour] = key.split("-").map(Number);
    return { day, hour, count };
  });
}

function sum(points: BioDailyPoint[], key: "views" | "visitors" | "clicks"): number {
  return points.reduce((total, p) => total + p[key], 0);
}

export function sampleBioStats(
  id: string,
  page: BioPageInput,
  days: number,
  maxDays: number,
  scale: number,
  hits: BioHitTotals = NO_HITS,
): BioPageStatsDetail {
  const series = dailySeries(id, days, scale);
  const before = series.slice(0, -days);
  const daily = series.slice(-days);
  const last = daily[daily.length - 1];
  if (last) {
    daily[daily.length - 1] = {
      ...last,
      views: last.views + hits.views,
      visitors: last.visitors + hits.views,
      clicks: last.clicks + hits.clicks,
    };
  }

  const views = sum(daily, "views");
  const clicks = sum(daily, "clicks");
  const sampleViews = views - hits.views;
  const sampleClicks = clicks - hits.clicks;
  const rand = seeded(`${id}:${days}`);
  const links = trackedLinks(page);
  const perLink = linkSplit(id, links, sampleClicks);

  const linkRows: BioLinkClicks[] = links
    .map((link) => ({ id: link.id, label: link.label, clicks: (perLink[link.id] ?? 0) + (hits.links[link.id] ?? 0) }))
    .sort((a, b) => b.clicks - a.clicks);

  const campaigns: Record<string, number> = sampleViews ? { [page.slug]: 0.46, bio: 0.31, launch_week: 0.14, newsletter: 0.09 } : {};

  return {
    days,
    maxDays,
    views,
    visitors: sum(daily, "visitors"),
    clicks,
    previous: scale && before.length ? { views: sum(before, "views"), visitors: sum(before, "visitors"), clicks: sum(before, "clicks") } : null,
    daily,
    links: linkRows,
    sources: merge(split(sampleViews, SOURCE_WEIGHTS, rand), hits.sources),
    referrers: merge(split(Math.round(sampleViews * 0.62), REFERRER_WEIGHTS, rand)),
    campaigns: merge(split(Math.round(sampleViews * 0.38), campaigns, rand)),
    countries: merge(split(sampleViews, COUNTRY_WEIGHTS, rand)),
    cities: merge(split(Math.round(sampleViews * 0.86), CITY_WEIGHTS, rand)),
    devices: merge(split(sampleViews, DEVICE_WEIGHTS, rand), hits.devices),
    browsers: merge(split(sampleViews, BROWSER_WEIGHTS, rand)),
    os: merge(split(sampleViews, OS_WEIGHTS, rand)),
    languages: merge(split(sampleViews, LANGUAGE_WEIGHTS, rand)),
    heatmap: heatmap(id, views),
  };
}

export function summaryStats(detail: BioPageStatsDetail): BioPageStats {
  return {
    views: detail.views,
    clicks: detail.clicks,
    linkClicks: Object.fromEntries(detail.links.map((link) => [link.id, link.clicks])),
  };
}
