import type { Insight, InsightsOverview } from "@/features/insights/types";

const now = Date.now();
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const insight = (i: Omit<Insight, "score">, score: number): Insight => ({ ...i, score });

export const demoInsights: InsightsOverview = {
  canRefresh: true,
  history: [{ id: "demo-week-1", weekStart: iso(3 * DAY), count: 6 }],
  digest: {
    id: "demo-week-1",
    weekStart: iso(3 * DAY),
    periodStart: iso(7 * DAY),
    periodEnd: iso(0),
    summary:
      "Your traffic grew by about a third, and most of the new visitors came from Product Hunt landing on your pricing page. Fewer people are leaving after one page, so the launch audience looks like a good fit.",
    visitors: 4_812,
    previousVisitors: 3_640,
    generatedAt: iso(0),
    insights: [
      insight(
        { id: "traffic", kind: "traffic", tone: "good", title: "Visitors up 32% this week", body: "4,812 visitors, against 3,640 the week before.", dimension: "", key: "", current: 4812, previous: 3640, delta: 32, unit: "visitors" },
        132,
      ),
      insight(
        { id: "source:new:producthunt.com", kind: "source", tone: "good", title: "New source: producthunt.com sent 1,140 visits", body: "1,140 visits this week, none the week before.", dimension: "referrer", key: "producthunt.com", current: 1140, previous: 0, delta: null, unit: "visits" },
        150,
      ),
      insight(
        { id: "page:up:/pricing", kind: "page", tone: "good", title: "/pricing views up 84%", body: "2,210 views this week, against 1,200 the week before.", dimension: "path", key: "/pricing", current: 2210, previous: 1200, delta: 84, unit: "views" },
        104,
      ),
      insight(
        { id: "source:down:google.com", kind: "source", tone: "bad", title: "google.com is sending 52% fewer visits", body: "310 visits this week, against 645 the week before.", dimension: "referrer", key: "google.com", current: 310, previous: 645, delta: -52, unit: "visits" },
        118,
      ),
      insight(
        { id: "page:down:/blog/analytics-guide", kind: "page", tone: "bad", title: "/blog/analytics-guide views down 61%", body: "140 views this week, against 360 the week before.", dimension: "path", key: "/blog/analytics-guide", current: 140, previous: 360, delta: -61, unit: "views" },
        96,
      ),
      insight(
        { id: "device:mobile", kind: "device", tone: "info", title: "Mobile now 58% of your traffic", body: "Up from 44% the week before. Check that key pages work well on a phone.", dimension: "device", key: "mobile", current: 58, previous: 44, delta: 14, unit: "% share" },
        69,
      ),
    ],
  },
};
