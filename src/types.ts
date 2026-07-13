export type Role = "admin" | "user";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** True when this session is an admin acting as someone else. */
  impersonating?: boolean;
};

/** A row in the admin's user switcher. */
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  workspaceCount: number;
};

export type AdminUserPage = {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
};

export type Workspace = {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Site = {
  _id: string;
  workspaceId: string;
  name: string;
  domain: string;
  framework: string;
  siteId: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  key?: string; // only present right after creation
};

export type Bucket = { key: string; count: number };

/** A CTA click: which label, on which page, and where it pointed. */
export type ClickBucket = Bucket & {
  path: string;
  href?: string;
  tag?: string;
};

export type Point = { bucket: string; views: number; visitors: number };

export type Deltas = {
  pageviews: number | null;
  visitors: number | null;
  sessions: number | null;
  bounceRate: number | null;
  avgSessionMs: number | null;
  pagesPerSession: number | null;
};

export type Stats = {
  range: string;

  // headline
  pageviews: number;
  visitors: number;
  sessions: number;
  live: number;

  // engagement
  bounceRate: number;
  avgSessionMs: number;
  avgTimeOnPageMs: number;
  pagesPerSession: number;

  deltas: Deltas;

  // breakdowns
  topPages: Bucket[];
  entryPages: Bucket[];
  exitPages: Bucket[];
  topReferrers: Bucket[];
  devices: Bucket[];
  browsers: Bucket[];
  operatingSystems: Bucket[];
  countries: Bucket[];
  languages: Bucket[];
  screenSizes: Bucket[];
  utmSources: Bucket[];
  utmCampaigns: Bucket[];

  // clicks
  clicks: ClickBucket[];
  clickCount: number;

  // how far down each page people get
  scrollDepth: ScrollBucket[];

  // traffic by hour and weekday
  heatmap: HeatCell[];

  // which entry points actually hold people
  landingPages: LandingBucket[];

  // real-time
  livePages: Bucket[];

  timeseries: Point[];

  siteCount?: number;

  /** Sites still running a tracker too old to report impressions or scroll depth. */
  outdatedSites?: { siteId: string; name: string }[];
};

export type ScrollBucket = {
  key: string;
  /** Engagement records behind the average. */
  count: number;
  avgDepth: number;
  /** Share of visits that reached the bottom of the page. */
  completionRate: number;
};

/** `day` is 0–6 from Sunday, `hour` is 0–23. */
export type HeatCell = { day: number; hour: number; count: number };

export type LandingBucket = {
  key: string;
  /** Sessions that started here. */
  count: number;
  bounceRate: number;
  pagesPerSession: number;
};
