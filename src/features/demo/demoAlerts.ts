import type { AlertDay, AlertHistoryItem, AlertsOverview } from "@/features/alerts/types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEMO_COUNTS = [0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 1];

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR_MS).toISOString();
}

function demoDaily(): AlertDay[] {
  const start = Date.now() - (DEMO_COUNTS.length - 1) * DAY_MS;
  return DEMO_COUNTS.map((count, i) => ({ day: new Date(start + i * DAY_MS).toISOString().slice(0, 10), count }));
}

const HISTORY: AlertHistoryItem[] = [
  {
    id: "demo-alert-1",
    rule: "trafficSpike",
    title: "Traffic up 164% on Acme Store",
    summary: "8,412 pageviews in the last 24 hours, against 3,187 at the same time last week.",
    link: "/app/analytics",
    createdAt: hoursAgo(5),
  },
  {
    id: "demo-alert-2",
    rule: "goalBehind",
    title: "“10K visitors this month” is 24% behind pace",
    summary: "On course for 7,600 of 10,000 by the end of October 2026.",
    link: "/app/goals",
    createdAt: hoursAgo(29),
  },
  {
    id: "demo-alert-3",
    rule: "trafficDrop",
    title: "Traffic down 52% on Acme Blog",
    summary: "1,204 pageviews in the last 24 hours, against 2,509 at the same time last week.",
    link: "/app/analytics",
    createdAt: hoursAgo(76),
  },
  {
    id: "demo-alert-4",
    rule: "trackingStopped",
    title: "Acme Docs stopped sending data",
    summary: "No events for 7 hours. Check that the tracking script is still on the site.",
    link: "/app/analytics",
    createdAt: hoursAgo(150),
  },
];

export function demoAlerts(): AlertsOverview {
  return {
    config: {
      rules: {
        trafficDrop: { enabled: true, value: 40 },
        trafficSpike: { enabled: true, value: 100 },
        trackingStopped: { enabled: true, value: 6 },
        goalBehind: { enabled: true, value: 20 },
        formsQuiet: { enabled: false, value: 3 },
      },
      channels: { email: true, telegram: true, whatsapp: false },
    },
    checkEveryHours: 1,
    lastCheckedAt: hoursAgo(0.3),
    nextCheckAt: new Date(Date.now() + 0.7 * HOUR_MS).toISOString(),
    ongoing: 1,
    sitesWatched: 2,
    incidents: [{ ...HISTORY[1], since: HISTORY[1].createdAt }],
    daily: demoDaily(),
    history: HISTORY,
    channels: {
      email: { available: true },
      telegram: { available: true, chats: 2 },
      whatsapp: { available: false, entitled: true, numbers: 0 },
    },
  };
}
