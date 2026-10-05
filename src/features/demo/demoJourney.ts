import type { JourneyUser, JourneyEvent } from "@/shared/types";
import { DEMO_SITE_ID, DEMO_SITE_ID_2 } from "@/features/demo/demoData";

/**
 * A believable set of traced app users, in the same spirit as `demoStats`:
 * deterministic, display-only, shaped like what the Platform API's track()
 * calls would have produced for Acme's two sites.
 */

/** Small deterministic PRNG (mulberry32) — same helper as demoStats.ts. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

type DemoUser = {
  appUserId: string;
  siteId: string;
  firstSeenAgo: number;
  lastSeenAgo: number;
  lastAction: string;
  /** Each entry is one session: a chain of [action, src, dest] steps. */
  sessions: [string, string, string][][];
};

const USERS: DemoUser[] = [
  {
    appUserId: "usr_8f2a1c9d4e",
    siteId: DEMO_SITE_ID,
    firstSeenAgo: 41 * DAY,
    lastSeenAgo: 6 * MIN,
    lastAction: "purchase",
    sessions: [
      [
        ["page_view", "", "/"],
        ["page_view", "/", "/pricing"],
        ["signup", "/pricing", "/pricing"],
      ],
      [
        ["page_view", "", "/dashboard"],
        ["page_view", "/dashboard", "/dashboard/billing"],
        ["purchase", "/dashboard/billing", "/dashboard/billing"],
      ],
    ],
  },
  {
    appUserId: "usr_3b7e5f10aa",
    siteId: DEMO_SITE_ID,
    firstSeenAgo: 28 * DAY,
    lastSeenAgo: 52 * MIN,
    lastAction: "docs_search",
    sessions: [
      [
        ["page_view", "", "/docs"],
        ["docs_search", "/docs", "/docs?q=webhooks"],
        ["page_view", "/docs?q=webhooks", "/docs/api/webhooks"],
      ],
    ],
  },
  {
    appUserId: "usr_c190d2e8b4",
    siteId: DEMO_SITE_ID_2,
    firstSeenAgo: 19 * DAY,
    lastSeenAgo: 3 * HOUR,
    lastAction: "page_view",
    sessions: [
      [
        ["page_view", "", "/docs"],
        ["page_view", "/docs", "/docs/getting-started"],
        ["page_view", "/docs/getting-started", "/docs/api"],
      ],
      [
        ["page_view", "", "/docs/changelog"],
      ],
    ],
  },
  {
    appUserId: "usr_7a4d9e21f3",
    siteId: DEMO_SITE_ID,
    firstSeenAgo: 63 * DAY,
    lastSeenAgo: 1 * DAY,
    lastAction: "trial_started",
    sessions: [
      [
        ["page_view", "", "/features"],
        ["page_view", "/features", "/pricing"],
        ["trial_started", "/pricing", "/pricing"],
      ],
    ],
  },
  {
    appUserId: "usr_e65b1a7c02",
    siteId: DEMO_SITE_ID,
    firstSeenAgo: 5 * DAY,
    lastSeenAgo: 2 * DAY,
    lastAction: "page_view",
    sessions: [
      [
        ["page_view", "", "/"],
        ["page_view", "/", "/blog/launch"],
      ],
    ],
  },
  {
    appUserId: "usr_94f0c3d7b1",
    siteId: DEMO_SITE_ID_2,
    firstSeenAgo: 11 * DAY,
    lastSeenAgo: 4 * DAY,
    lastAction: "docs_search",
    sessions: [
      [
        ["page_view", "", "/docs"],
        ["docs_search", "/docs", "/docs?q=rate+limits"],
      ],
      [
        ["page_view", "", "/docs/api"],
        ["page_view", "/docs/api", "/docs/api/errors"],
        ["page_view", "/docs/api/errors", "/docs/api/webhooks"],
      ],
    ],
  },
  {
    appUserId: "usr_1d8a6f2309",
    siteId: DEMO_SITE_ID,
    firstSeenAgo: 2 * DAY,
    lastSeenAgo: 9 * DAY,
    lastAction: "page_view",
    sessions: [
      [
        ["page_view", "", "/"],
        ["page_view", "/", "/about"],
      ],
    ],
  },
];

/** Build one user's full event feed, oldest first, spread across their sessions. */
function buildEvents(user: DemoUser): JourneyEvent[] {
  const rand = rng(0x4a21 + user.appUserId.length);
  const events: JourneyEvent[] = [];
  const span = user.firstSeenAgo - user.lastSeenAgo;
  const gapPerSession = user.sessions.length > 1 ? span / (user.sessions.length - 1) : 0;

  user.sessions.forEach((steps, sessionIndex) => {
    const sessionAgo = user.firstSeenAgo - sessionIndex * gapPerSession;
    const sessionId = `sess_${user.appUserId.slice(4, 10)}_${sessionIndex}`;
    let stepAgo = sessionAgo;

    steps.forEach(([action, src, dest]) => {
      events.push({
        siteId: user.siteId,
        action,
        src,
        dest,
        sessionId,
        ts: iso(stepAgo),
      });
      // Each step a little closer to "now" than the last, a few seconds to a
      // couple of minutes apart — a believable pace for someone clicking
      // through a site rather than a uniform tick.
      stepAgo -= 8_000 + rand() * 110_000;
    });
  });

  return events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

const eventsByUser = new Map<string, JourneyEvent[]>(
  USERS.map((u) => [u.appUserId, buildEvents(u)]),
);

export function demoJourneyUsers(): {
  users: JourneyUser[];
  total: number;
  summary: { users: number; events: number; activeToday: number };
  page: number;
  pageSize: number;
} {
  const users: JourneyUser[] = USERS.map((u) => {
    const events = eventsByUser.get(u.appUserId) ?? [];
    return {
      appUserId: u.appUserId,
      lastSeen: iso(u.lastSeenAgo),
      firstSeen: iso(u.firstSeenAgo),
      lastAction: u.lastAction,
      siteId: u.siteId,
      eventCount: events.length,
      sessionCount: u.sessions.length,
    };
  }).sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  const totalEvents = users.reduce((sum, u) => sum + u.eventCount, 0);
  const activeToday = users.filter((u) => now - new Date(u.lastSeen).getTime() < DAY).length;

  return {
    users,
    total: users.length,
    summary: { users: users.length, events: totalEvents, activeToday },
    page: 1,
    pageSize: users.length,
  };
}

export function demoJourneyTimeline(appUserId: string): { appUserId: string; events: JourneyEvent[] } {
  return { appUserId, events: eventsByUser.get(appUserId) ?? [] };
}
