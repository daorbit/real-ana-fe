import type {
  ScheduledPost, ScheduledPostsResponse, SentPost, SentPostsResponse, PostAccount,
} from "@/shared/types";

/**
 * A believable set of scheduled and published posts for Acme, in the same
 * spirit as `demoStats`: deterministic, display-only, shaped like what the
 * social endpoints actually return.
 */

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const inIso = (msAhead: number) => new Date(now + msAhead).toISOString();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const demoLinkedin: PostAccount = {
  connected: true,
  expired: false,
  name: "Acme Inc.",
  picture: "https://acme.example/logo.svg",
  canPublish: true,
};

const demoInstagram: PostAccount = {
  connected: true,
  expired: false,
  name: "acme.hq",
  picture: "https://acme.example/logo.svg",
  canPublish: true,
};

const basePost = (over: Partial<ScheduledPost>): ScheduledPost => ({
  id: "demo-post",
  provider: "linkedin",
  format: "feed",
  workspaceId: "demo-workspace",
  name: "Scheduled post",
  caption: "",
  imageUrl: "",
  images: [],
  mode: "once",
  runAt: null,
  frequency: "weekly",
  hour: 9,
  minute: 0,
  timezone: "UTC",
  weekday: 1,
  dayOfMonth: 1,
  status: "active",
  nextRunAt: iso(0),
  lastRunAt: null,
  lastStatus: "",
  lastError: "",
  lastPostUrl: "",
  postCount: 0,
  createdAt: iso(10 * DAY),
  ...over,
});

const demoScheduledPosts: ScheduledPost[] = [
  basePost({
    id: "demo-post-1",
    name: "Launch week teaser",
    caption: "Something new is landing this week. Deploy in minutes, worry less. 🚀",
    imageUrl: "https://acme.example/hero.png",
    images: ["https://acme.example/hero.png"],
    mode: "once",
    runAt: inIso(4 * HOUR),
    nextRunAt: inIso(4 * HOUR),
    status: "active",
    createdAt: iso(2 * DAY),
  }),
  basePost({
    id: "demo-post-2",
    provider: "instagram",
    name: "Weekly tips reminder",
    caption: "Tip of the week: code-split your analytics bundle. Your LCP will thank you.",
    imageUrl: "https://acme.example/chart.png",
    images: ["https://acme.example/chart.png"],
    mode: "repeat",
    frequency: "weekly",
    hour: 10,
    minute: 30,
    weekday: 3,
    nextRunAt: inIso(2 * DAY),
    status: "active",
    createdAt: iso(30 * DAY),
    postCount: 6,
  }),
  basePost({
    id: "demo-post-3",
    name: "Pricing page refresh",
    caption: "Our pricing just got simpler. Usage-based, no surprises.",
    imageUrl: "",
    mode: "once",
    runAt: inIso(26 * HOUR),
    nextRunAt: inIso(26 * HOUR),
    status: "paused",
    createdAt: iso(1 * DAY),
  }),
  basePost({
    id: "demo-post-4",
    provider: "instagram",
    format: "story",
    name: "Changelog story",
    caption: "",
    imageUrl: "https://acme.example/hero.png",
    images: ["https://acme.example/hero.png"],
    mode: "once",
    runAt: iso(3 * HOUR),
    nextRunAt: iso(3 * HOUR),
    status: "active",
    lastRunAt: iso(3 * HOUR),
    lastStatus: "failed",
    lastError: "Instagram rejected the image: file too large.",
    createdAt: iso(3 * HOUR + 10 * MIN),
  }),
];

export function demoScheduledPostsResponse(): ScheduledPostsResponse {
  return { posts: demoScheduledPosts, linkedin: demoLinkedin, instagram: demoInstagram };
}

const baseSent = (over: Partial<SentPost>): SentPost => ({
  id: "demo-sent",
  provider: "linkedin",
  format: "feed",
  scheduledPostId: null,
  workspaceId: "demo-workspace",
  name: "Sent post",
  caption: "",
  imageUrl: "",
  source: "schedule",
  status: "published",
  error: "",
  postUrl: "",
  publishedAt: iso(0),
  stats: {
    impressions: null,
    uniqueImpressions: null,
    likes: null,
    comments: null,
    shares: null,
    clicks: null,
    engagement: null,
    fetchedAt: null,
    unavailable: "scope",
  },
  ...over,
});

const demoSentPosts: SentPost[] = [
  baseSent({
    id: "demo-sent-1",
    scheduledPostId: "demo-post-past-1",
    name: "Developer tools that get out of the way",
    caption: "We rebuilt our onboarding from scratch. Three minutes to first deploy, not thirty.",
    imageUrl: "https://acme.example/hero.png",
    source: "schedule",
    status: "published",
    postUrl: "https://www.linkedin.com/feed/update/demo-1",
    publishedAt: iso(2 * DAY),
  }),
  baseSent({
    id: "demo-sent-2",
    provider: "instagram",
    scheduledPostId: "demo-post-2",
    name: "Weekly tips reminder",
    caption: "Tip of the week: preload your hero image and serve it as WebP.",
    imageUrl: "https://acme.example/chart.png",
    source: "schedule",
    status: "published",
    postUrl: "https://www.instagram.com/p/demo-2",
    publishedAt: iso(9 * DAY),
  }),
  baseSent({
    id: "demo-sent-3",
    scheduledPostId: null,
    name: "Shared from the composer",
    caption: "Rollbacks, audit logs, SSO — all the things teams actually ask for.",
    imageUrl: "",
    source: "manual",
    status: "published",
    postUrl: "https://www.linkedin.com/feed/update/demo-3",
    publishedAt: iso(16 * DAY),
  }),
  baseSent({
    id: "demo-sent-4",
    provider: "instagram",
    scheduledPostId: "demo-post-past-4",
    name: "Changelog carousel",
    caption: "",
    imageUrl: "https://acme.example/hero.png",
    source: "schedule",
    status: "failed",
    error: "Instagram rejected the image: file too large.",
    publishedAt: iso(20 * DAY),
  }),
];

const demoSentAuthor = { name: demoLinkedin.name, picture: demoLinkedin.picture ?? "" };

export function demoSentPostsResponse(status?: "failed"): SentPostsResponse {
  const posts = status === "failed"
    ? demoSentPosts.filter((p) => p.status === "failed")
    : demoSentPosts;
  return {
    posts,
    nextCursor: null,
    author: demoSentAuthor,
    statsAvailable: false,
  };
}
