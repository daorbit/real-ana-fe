export type Role = "admin" | "user";

export type User = {
  id: string;
  email: string;
  /** Display name — derived from firstName/lastName by the server. */
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  /** Remote image URL. Empty falls back to initials. */
  avatarUrl: string;
  /** BCP 47 tag, e.g. "en-GB". Empty means "follow the browser". */
  dateLocale: string;
  /** IANA zone, e.g. "Asia/Kolkata". Empty means "follow the browser". */
  timezone: string;
  role: Role;
  /** True when this session is an admin acting as someone else. */
  impersonating?: boolean;
};

/** Fields the settings form can change. Email and role are not among them. */
export type ProfileUpdate = Partial<
  Pick<User, "firstName" | "lastName" | "mobile" | "avatarUrl" | "dateLocale" | "timezone">
>;

/** A row in the admin's user switcher. */
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  workspaceCount: number;
  siteCount: number;
  eventCount: number;
  /** null until the account's first site reports. */
  lastEventAt: string | null;
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

  // custom events fired via rta.track()
  customEvents: EventBucket[];
  // summed props.value across all custom events (goal revenue)
  totalRevenue: number;

  // marketing channels: how sessions arrived
  channels: Bucket[];

  // where visitors leave to: outbound links and downloads
  outboundClicks: OutboundBucket[];

  // client-side errors the tracker forwarded
  errors: ErrorBucket[];

  // conversion goals scored over this window
  goals: GoalResult[];

  // real-time
  livePages: Bucket[];

  timeseries: Point[];

  siteCount?: number;

  /** Sites still running a tracker too old to report impressions or scroll depth. */
  outdatedSites?: { siteId: string; name: string }[];

  /** The active dashboard-wide filter this payload was computed under. */
  filters?: StatsFilter;
};

/** A dashboard-wide filter. Each set key narrows every number to that segment. */
export type StatsFilter = Partial<{
  country: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
  path: string;
  language: string;
  utmSource: string;
  utmCampaign: string;
  eventName: string;
}>;

/** One step a user defines in the funnel builder. */
export type FunnelStepInput = { type: "page" | "event"; value: string };

/** One computed step of a funnel — how many sessions reached it. */
export type FunnelResultStep = {
  label: string;
  type: "page" | "event";
  /** Sessions that reached this step in order. */
  count: number;
  /** Conversion from the top of the funnel, as a percentage. */
  rate: number;
  /** Drop-off from the previous step, as a percentage. */
  dropFromPrev: number;
};

/** One weekly retention cohort: how many started, and their return curve. */
export type RetentionCohort = {
  /** Week index from the start of the observed window. */
  cohort: number;
  /** Visitors first seen in this cohort week. */
  size: number;
  /** Retention % per week offset; index 0 is always 100. */
  retention: number[];
};

/** Serialize a filter object into the `key:value;key:value` query value. */
export function serializeFilter(f: StatsFilter): string {
  return Object.entries(f)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

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

/** An outbound link click or file download, grouped by destination. */
export type OutboundBucket = Bucket & {
  /** "outbound" | "download" */
  kind: string;
};

/** A client-side error, grouped by message and the page it happened on. */
export type ErrorBucket = Bucket & {
  path: string;
  lastSeen: string;
};

/** A conversion goal definition. */
export type Goal = {
  id: string;
  name: string;
  kind: "page" | "event";
  /** Path (page goal) or event name (event goal) that counts as a conversion. */
  match: string;
};

/** A goal scored over a window: how many converted and at what rate. */
export type GoalResult = Goal & {
  /** Distinct visitors who converted. */
  conversions: number;
  /** Share of window visitors who converted, as a percentage. */
  conversionRate: number;
};

/** A custom event fired via `rta.track(name, props)`. */
export type EventBucket = {
  key: string;
  /** Times the event fired. */
  count: number;
  /** Distinct visitors who fired it. */
  visitors: number;
  /** Share of all visitors in the window who fired it at least once. */
  conversionRate: number;
  /** Summed numeric `props.value` across fires — revenue attributed to this event. */
  revenue: number;
};
