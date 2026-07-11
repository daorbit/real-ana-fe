export type User = { id: string; email: string; name: string };

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

  // real-time
  livePages: Bucket[];

  timeseries: Point[];

  siteCount?: number;
};
