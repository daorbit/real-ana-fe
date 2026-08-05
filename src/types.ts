import type { TrackerOptions } from "./utils/tracker";

/** `super_admin` is never returned by any role-change endpoint — only a direct DB write sets it. */
export type Role = "super_admin" | "admin" | "user";

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
  /** True once the account has signed in with Google at least once. */
  googleLinked?: boolean;
  /** False on Google-only accounts, which have never set a password. */
  hasPassword?: boolean;
  /** True when this session is an admin acting as someone else. */
  impersonating?: boolean;
  /** True on the read-only public demo session. */
  demo?: boolean;
  /** Plan and usage-quota state, bundled with the profile — null if never subscribed (shouldn't happen post-signup). */
  billing?: QuotaSummary;
};

/** Fields the settings form can change. Email and role are not among them. */
export type ProfileUpdate = Partial<
  Pick<User, "firstName" | "lastName" | "mobile" | "avatarUrl" | "dateLocale" | "timezone">
>;

/** Which panels a public shared dashboard shows. */
export type SharePanels = {
  totals: boolean;
  trend: boolean;
  pages: boolean;
  sources: boolean;
  countries: boolean;
  devices: boolean;
  /** Added after launch — these default to off on the server. */
  browsers: boolean;
  operatingSystems: boolean;
  entryPages: boolean;
  exitPages: boolean;
  languages: boolean;
  channels: boolean;
  engagement: boolean;
  visitorSplit: boolean;
};

export type ShareState = {
  enabled: boolean;
  token: string | null;
  panels: SharePanels;
  /** Times the public link has been opened. Resets when the link is rotated. */
  views: number;
  lastViewedAt: string | null;
};

/**
 * Admin view of how the public demo is being used.
 *
 * A rolling 24-hour window, which is all the throttle keeps — no visitor
 * address is stored and nothing older survives, so there is no history here.
 */
export type DemoUsage = {
  /** Sessions one address may start per day before being refused. */
  limit: number;
  /** Demo starts in the last 24 hours, across all addresses. */
  today: number;
  /** Distinct addresses with a start in the last 24 hours. */
  activeIps: number;
  /** Attempts the limit turned away in the same window. */
  blocked: number;
  /** Start of the window these figures cover. */
  since: string;
};

/* ---------------------------------- billing --------------------------------- */

/** Currencies sold through Razorpay's international checkout. */
export const CURRENCIES = ["INR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = { INR: "₹", USD: "$" };

/** Amount in the smallest unit of each currency (paise/cents). */
export type CurrencyPrices = Record<Currency, number>;

/**
 * A resolved plan: the fixed catalogue entry (name, quotas, limits — all
 * decided in backend code) merged with its current price (the one thing an
 * admin can change). There's no `_id`/`active`/`sortOrder` here because plans
 * aren't documents the client creates or deletes — `slug` is the identity.
 */
export type Plan = {
  slug: string;
  name: string;
  description: string;
  priceMonthly: CurrencyPrices;
  priceYearly: CurrencyPrices;
  maxWorkspaces: number;
  maxSitesPerWorkspace: number;
  monthlyAuditQuota: number;
  monthlyCrawlQuota: number;
  features: string[];
};

/**
 * The exchange rate the non-INR plan prices were last computed from.
 *
 * `rates` is quote-units per 1 INR, so a USD rate of 0.0115 means ₹1 ≈ $0.0115.
 */
export type FxSnapshot = {
  rates: Partial<Record<Currency, number>>;
  fetchedAt: string;
  nextUpdateAt?: string;
};

export type FxStatus = {
  /** False when the backend has no exchangerate-api key — the sync button can't work. */
  configured: boolean;
  base: Currency;
  snapshot: FxSnapshot | null;
};

/**
 * A recurring emailed report.
 *
 * Frequencies stop at "daily" on purpose — a schedule can never send more than
 * once in 24 hours, enforced server-side rather than only by this list.
 */
export const REPORT_FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type ReportFrequency = (typeof REPORT_FREQUENCIES)[number];

export type ReportRecipient = {
  email: string;
  /** They followed the unsubscribe link — still listed, but skipped at send time. */
  unsubscribed: boolean;
};

/** A WhatsApp destination on a report. */
export type ReportPhoneRecipient = {
  /** Digits only, country code first — normalised server-side. */
  phone: string;
  label: string;
  /** Removed from delivery by the owner, without deleting the row. */
  optedOut: boolean;
};

/** Which channels a report goes out on. At least one is always true. */
export type ReportChannels = { email: boolean; whatsapp: boolean };

/** Whether WhatsApp delivery is available, and the paired session's live state. */
export type WhatsAppStatus = {
  configured: boolean;
  status?: "connected" | "pairing" | "disconnected" | "error" | string;
  phoneNumber?: string;
  error?: string;
};

export type ReportSchedule = {
  id: string;
  name: string;
  /** Empty means every site in the workspace, resolved when the report is sent. */
  siteIds: string[];
  frequency: ReportFrequency;
  recipients: ReportRecipient[];
  phoneRecipients: ReportPhoneRecipient[];
  channels: ReportChannels;
  include: { analytics: boolean; seo: boolean; dashboardLink: boolean };
  attachXlsx: boolean;
  enabled: boolean;
  lastSentAt?: string;
  nextRunAt: string;
  /** Why the last run failed, if it did. */
  lastError?: string;
};

export type ReportScheduleInput = {
  name: string;
  siteIds: string[];
  frequency: ReportFrequency;
  /** Extra addresses only — the owner's own is always added server-side. */
  recipients: string[];
  /**
   * Not sent by the client: WhatsApp is delivered to the account owner's own
   * mobile, which the server reads from their profile.
   */
  channels: ReportChannels;
  include: { analytics: boolean; seo: boolean; dashboardLink: boolean };
  attachXlsx: boolean;
  enabled?: boolean;
};

export type BillingCycle = "monthly" | "yearly";

export type AddonType = "audit" | "crawl";

export type AddonPack = {
  _id: string;
  name: string;
  slug: string;
  type: AddonType;
  quantity: number;
  price: CurrencyPrices;
  active: boolean;
  sortOrder: number;
};

export type QuotaSummary = {
  plan: { slug: string; name: string };
  cycle: BillingCycle;
  status: "active" | "expired";
  currentPeriodEnd: string | null;
  audits: { planQuota: number; used: number; addonCredits: number };
  crawls: { planQuota: number; used: number; addonCredits: number };
  workspaces: { quota: number; used: number };
  maxSitesPerWorkspace: number;
  /** Analytics date ranges this plan may query — everything else needs an upgrade. */
  allowedRanges: ("1h" | "24h" | "7d" | "30d" | "custom")[];
  /** Whether reports may be delivered over WhatsApp. Pro only. */
  whatsappReports: boolean;
} | null;

/**
 * A ₹0 plan (Free) is assigned server-side with no order — `free: true` and
 * nothing else. A paid plan returns a Razorpay Order to check out with, same
 * shape as `StartAddonPurchaseResponse`.
 */
export type StartSubscriptionResponse =
  | { free: true; plan: { name: string; cycle: BillingCycle } }
  | {
      free?: false;
      orderId: string;
      amount: number;
      currency: string;
      razorpayKeyId: string;
      plan: { name: string; cycle: BillingCycle };
      /** Packs bought in the same checkout, priced and confirmed server-side. */
      addons?: { name: string; type: AddonType; packs: number; credits: number }[];
    };

export type StartAddonPurchaseResponse = {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  addon: { name: string; type: AddonType; quantity: number; packs: number; credits: number };
};

/** How many of one pack the user has chosen, keyed by pack slug. */
export type AddonSelection = Record<string, number>;

/* --------------------------------- receipts ---------------------------------- */

/**
 * One paid purchase, as it appears in billing history.
 *
 * A receipt rather than a tax invoice — the business isn't GST registered, so
 * there is no tax line to show and none is sent. `amount` is in the smallest
 * currency unit, like every other price in the app.
 */
export type Invoice = {
  id: string;
  /** Which collection it came from — the download URL needs it. */
  kind: "plan" | "addon";
  /** `QTL-YYYYMM-NNNN`. */
  number: string;
  issuedAt: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentId: string;
};

/* ---------------------------------- coupons ---------------------------------- */

export type Coupon = {
  _id: string;
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt: string | null;
};

export type CouponCheckResult = {
  amount: number;
  error?: string;
  coupon?: { code: string; percentOff: number };
};

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
  /** null when the account has no subscription row at all. */
  plan: { slug: string; name: string; expired: boolean } | null;
};

export type AdminUserPage = {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
};

/* --------------------------- contact form inbox --------------------------- */

export type ContactStatus = "new" | "read" | "replied" | "spam";

export type ContactSubject =
  | "general"
  | "sales"
  | "support"
  | "platform-api"
  | "privacy"
  | "other"
  // Raised from inside the dashboard rather than the marketing site.
  | "bug"
  | "feedback"
  // A newsletter signup rather than correspondence — no reply is expected.
  | "newsletter";

/** Which surface a message came from. */
export type ContactSource = "marketing" | "app" | "newsletter";

/**
 * One message from the marketing site's contact form.
 *
 * The server never sends `ipHash` — it exists to rate-limit a flood, not to be
 * looked at — so it is deliberately absent here too.
 */
export type ContactReply = {
  subject: string;
  body: string;
  /** Email of the admin who sent it. */
  sentBy: string;
  sentAt: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  company: string;
  subject: ContactSubject;
  message: string;
  pageUrl: string;
  /** Optional: messages stored before the field existed default to marketing. */
  source?: ContactSource;
  /** The account that sent it, when it came from a signed-in user. */
  userId?: string | null;
  status: ContactStatus;
  adminNote: string;
  /** Optional: messages stored before replies existed come back without it. */
  replies?: ContactReply[];
  userAgent: string;
  createdAt: string;
  readAt: string | null;
  /** When the automatic receipt went out; null means it never did. */
  ackSentAt: string | null;
};

export type ContactMessagePage = {
  messages: ContactMessage[];
  total: number;
  /** Count of messages still in "new", regardless of the current filter. */
  unread: number;
  page: number;
  pages: number;
};

/** Full billing detail for one account, shown in the admin plan dialog. */
export type AdminUserBilling =
  | { subscribed: false }
  | ({
      subscribed: true;
    } & QuotaSummary);

/** Which accounts a broadcast goes to. Mirrors the server's segment ids. */
export type EmailSegmentId = "all" | "not-installed" | "no-sites" | "installed";

/**
 * A template's intended audience.
 *
 * "custom" is not a segment the server can resolve — it means the message is
 * addressed at people who have no account, so the composer collects addresses
 * by hand instead of resolving a user list. Kept out of `EmailSegmentId` for
 * exactly that reason: passing it to `/email/recipients` would be an error.
 */
export type MailAudience = EmailSegmentId | "custom";

export type EmailSegment = {
  id: EmailSegmentId;
  label: string;
  description: string;
  count: number;
};

export type EmailRecipient = {
  id: string;
  email: string;
  name: string;
};

/** Whether the server has SMTP credentials, and the address it sends as. */
export type EmailStatus = {
  configured: boolean;
  from: string;
};

/**
 * How the server renders a message body.
 *
 * "plain" turns the author's text into paragraphs and nothing more. "invite"
 * adds the designed feature list and closing note under it — for the one
 * template addressed at people who have never heard of Quantalog.
 */
export type MailLayout = "plain" | "invite";

/** A canned message. The copy lives server-side so it can be fixed without a build. */
export type MailTemplate = {
  id: string;
  label: string;
  hint: string;
  segment: MailAudience;
  subject: string;
  body: string;
  /** Optional button. Not every template has one — a check-in wants no call to action. */
  cta?: { label: string; href: string };
  /** Absent means "plain". */
  layout?: MailLayout;
};

export type EmailSendResult = {
  sent: number;
  failed: number;
  /** Only bounced addresses — successes are just the recipient list echoed back. */
  failures: { email: string; ok: false; error?: string }[];
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
  /**
   * The options the snippet was built with. Stored so the dashboard can
   * rebuild the exact tag later — the tracker itself reads them from the
   * pasted script tag, not from here.
   */
  trackerOptions?: TrackerOptions;
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

/** First-time vs repeat visitors over the selected window. */
export type VisitorSplit = {
  /** Visitors not seen before this window opened. */
  new: number;
  /** Visitors already seen before this window opened. */
  returning: number;
  /** `returning` as a percentage of all visitors in the window. */
  returningRate: number;
};

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
  visitorSplit: VisitorSplit;

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

/* ---------------------------------- SEO ---------------------------------- */

export type SeoMetaTag = { name: string; content: string };

export type SeoMeta = {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  viewport: string;
  charset: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
  twitterSite: string;
  canonical: string;
  favicon: string;
  allMetaTags: SeoMetaTag[];
};

export type SeoImage = {
  src: string;
  alt: string;
  title: string;
  width: number | null;
  height: number | null;
  loading: string;
  hasAlt: boolean;
};

export type SeoHeadingLevel = { level: number; count: number; texts: string[] };

/** A term and how much of the page body it accounts for, as a percentage. */
export type SeoKeyword = { word: string; count: number; density: number };

export type SeoContent = {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  imgCount: number;
  linkCount: number;
  wordCount: number;
  hasSchema: boolean;
  schemaTypes: string[];
  internalLinks: number;
  externalLinks: number;
  headingStructure: SeoHeadingLevel[];
  keywordDensity: SeoKeyword[];
  /** Flesch Reading Ease, 0-100. Higher is easier to read. */
  readabilityScore: number;
  contentQuality: number;
  images: SeoImage[];
};

export type SeoTechnical = {
  statusCode: number;
  contentType: string;
  contentLength: string;
  server: string;
  hasHttps: boolean;
  hasMobileViewport: boolean;
  hasFavicon: boolean;
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  hasStructuredData: boolean;
  totalImages: number;
  imageAltCount: number;
  missingAltImages: number;
  responseTimeMs: number;
};

/** Lighthouse category scores, 0-100. Null when the audit did not run. */
export type SeoScores = {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
};

/** Core Web Vitals and friends, in milliseconds (CLS is unitless). */
export type SeoMetrics = {
  firstContentfulPaint: number | null;
  speedIndex: number | null;
  largestContentfulPaint: number | null;
  interactive: number | null;
  totalBlockingTime: number | null;
  cumulativeLayoutShift: number | null;
};

export type SeoStrategyResult = {
  strategy: "mobile" | "desktop";
  scores: SeoScores;
  metrics: SeoMetrics;
};

export type SeoSuggestion = {
  id: string;
  title: string;
  /** Lighthouse category the audit belongs to, e.g. "performance". */
  category: string;
  score: number;
  displayValue: string | null;
  description: string;
  /** Plain-language fix, with estimated savings when Lighthouse reports them. */
  advice: string;
  /** Up to five offending URLs from the audit details. */
  resources: string[];
};

export type SeoPerformance = {
  available: boolean;
  /** Why the Lighthouse run produced nothing, when it did not. */
  note?: string;
  scores: SeoScores;
  desktop: SeoStrategyResult | null;
  mobile: SeoStrategyResult | null;
  suggestions: SeoSuggestion[];
};

/** One finding from the robots.txt or sitemap validator. */
export type SeoFileFinding = {
  severity: "critical" | "warning" | "info";
  message: string;
  /** 1-indexed line in robots.txt, where the finding came from one. */
  line?: number;
};

export type SeoRobotsGroup = {
  userAgents: string[];
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
};

export type SeoRobotsReport = {
  present: boolean;
  url: string;
  content: string;
  groups: SeoRobotsGroup[];
  sitemaps: string[];
  /** True when `User-agent: *` disallows the whole site. */
  blocksEverything: boolean;
  blocksAuditedUrl: boolean;
  findings: SeoFileFinding[];
};

export type SeoSitemapReport = {
  present: boolean;
  urls: string[];
  urlCount: number;
  isIndex: boolean;
  bytes: number;
  findings: SeoFileFinding[];
};

/** One structured-data problem. Errors block rich results; warnings weaken them. */
export type SeoSchemaFinding = {
  severity: "error" | "warning";
  type: string;
  property?: string;
  message: string;
};

export type SeoSchemaBlock = {
  index: number;
  types: string[];
  valid: boolean;
};

export type SeoLinkStatus =
  | "ok"
  | "broken"
  | "server-error"
  | "redirect"
  | "timeout"
  | "blocked"
  | "skipped";

export type SeoLinkResult = {
  url: string;
  /** Visible anchor text, for locating the link on the page. */
  text: string;
  internal: boolean;
  status: SeoLinkStatus;
  statusCode: number | null;
  /** Hops when the link redirected; empty otherwise. */
  chain: string[];
  elapsedMs: number;
  note?: string;
};

export type SeoLinkCheck = {
  checked: number;
  skipped: number;
  broken: number;
  serverErrors: number;
  redirects: number;
  timeouts: number;
  results: SeoLinkResult[];
};

export type SeoSchemaValidation = {
  blocks: SeoSchemaBlock[];
  types: string[];
  findings: SeoSchemaFinding[];
  errorCount: number;
  warningCount: number;
};

export type SeoSiteFiles = {
  robotsTxt: { present: boolean; url: string };
  sitemap: { present: boolean; urls: string[] };
  /** Full validation. Absent on reports stored before the validator shipped. */
  robotsReport?: SeoRobotsReport;
  sitemapReport?: SeoSitemapReport;
};

export type SeoIssue = {
  severity: "critical" | "warning" | "info";
  area: "meta" | "content" | "technical" | "files";
  title: string;
  detail: string;
};

/** The audit body itself, as produced by the server's SEO analyser. */
export type SeoReportData = {
  url: string;
  /** Where the fetch landed after redirects. */
  finalUrl: string;
  meta: SeoMeta;
  content: SeoContent;
  technical: SeoTechnical;
  performance: SeoPerformance;
  siteFiles: SeoSiteFiles;
  /** JSON-LD validation. Absent on reports stored before the validator shipped. */
  schema?: SeoSchemaValidation;
  /** Link check results. Absent on reports stored before the checker shipped. */
  links?: SeoLinkCheck;
  issues: SeoIssue[];
  score: number;
};

/** A stored report. History rows omit `data`. */
export type SeoReport = {
  _id: string;
  siteId: string;
  url: string;
  score: number;
  scores: SeoScores;
  issueCount: number;
  criticalCount: number;
  data?: SeoReportData;
  createdAt: string;
};

/**
 * Which sections of an audit an owner has chosen to publish. Anything off is
 * stripped server-side, so it never reaches the public page at all.
 */
export type SeoSharePanels = {
  /** Score band + Lighthouse category rings. */
  summary: boolean;
  issues: boolean;
  technical: boolean;
  /** Full performance metrics + opportunity list. */
  performance: boolean;
  meta: boolean;
  content: boolean;
  links: boolean;
  schema: boolean;
};

/** Per-report share state, returned by the owner-facing share endpoints. */
export type SeoShareState = {
  enabled: boolean;
  token: string | null;
  panels: SeoSharePanels;
  /** Times the public link has been opened. Resets when the link is rotated. */
  views: number;
  lastViewedAt: string | null;
};

/**
 * The public, read-only shape of a shared audit. Sections the owner did not
 * publish arrive as null/empty — the server omits them, they are not merely
 * hidden here.
 */
export type PublicSeoReport = {
  url: string;
  finalUrl: string;
  score: number;
  createdAt: string;
  panels: SeoSharePanels;
  performance: SeoPerformance | null;
  issues: SeoIssue[];
  meta: SeoMeta | null;
  content: SeoContent | null;
  technical: SeoTechnical | null;
  siteFiles: SeoSiteFiles | null;
  links: SeoLinkCheck | null;
  schema: SeoSchemaValidation | null;
};

/** A history row: the same document with the heavy body left out. */
export type SeoReportSummary = Omit<SeoReport, "data">;

/** A competitor page snapshot, scored on on-page signals only. */
export type SeoCompareSnapshot = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  statusCode: number;
  responseTimeMs: number;
  pageBytes: number;

  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;

  h1Count: number;
  h2Count: number;
  wordCount: number;
  imageCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;

  hasHttps: boolean;
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  hasStructuredData: boolean;
  schemaTypes: string[];
  schemaErrors: number;

  score: number;
};

export type SeoCompetitor = {
  _id: string;
  siteId: string;
  label: string;
  url: string;
  snapshot: SeoCompareSnapshot | null;
  lastCheckedAt: string | null;
  /** Why the last fetch failed, when it did. Empty on success. */
  lastError: string;
  createdAt: string;
};

/** Organic search arrivals, derived from stored referrers. */
export type SeoSearchTraffic = {
  visits: number;
  visitors: number;
  /** All visits in the window, for computing organic share. */
  totalVisits: number;
  engines: { engine: string; visits: number; visitors: number }[];
  landingPages: { path: string; visits: number; visitors: number }[];
  /**
   * Query terms actually present in referrers. Usually empty — Google and the
   * other major engines stopped passing them in 2011.
   */
  terms: { term: string; visits: number }[];
  hasTerms: boolean;
  /** Window the figures cover. */
  days: number;
};

export type SeoVitalKey = "lcp" | "cls" | "inp" | "fcp" | "ttfb";

export type SeoVitalSummary = {
  /** 75th percentile — the figure Google judges a page on. */
  p75: number | null;
  p50: number | null;
  samples: number;
  /** Share of samples in each Google band, as percentages. */
  good: number;
  needsImprovement: number;
  poor: number;
  rating: "good" | "needs-improvement" | "poor" | "none";
};

/** Core Web Vitals measured by real visitors (tracker v5+). */
export type SeoFieldVitals = {
  samples: number;
  days: number;
  metrics: Record<SeoVitalKey, SeoVitalSummary>;
  byPage: { path: string; lcp: number | null; cls: number | null; samples: number }[];
  /** What this site's script reports, for telling "too old" from "no traffic". */
  trackerVersion: number;
  requiredVersion: number;
};

/** One page as seen by a site-wide crawl. */
export type SeoCrawlPage = {
  url: string;
  path: string;
  statusCode: number;
  title: string | null;
  titleLength: number;
  description: string;
  descriptionLength: number;
  h1Count: number;
  wordCount: number;
  canonical: string;
  noindex: boolean;
  internalLinks: number;
  externalLinks: number;
  imagesMissingAlt: number;
  hasSchema: boolean;
  responseTimeMs: number;
  error?: string;
};

/** A problem visible only by comparing pages against each other. */
export type SeoCrawlFinding = {
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  /** Paths exhibiting the problem, capped for display. */
  pages: string[];
};

export type SeoCrawlData = {
  startedAt: string;
  finishedAt: string;
  discovered: number;
  crawled: number;
  pages: SeoCrawlPage[];
  findings: SeoCrawlFinding[];
  score: number;
};

export type SeoCrawlReport = {
  _id: string;
  siteId: string;
  origin: string;
  score: number;
  crawled: number;
  discovered: number;
  findingCount: number;
  criticalCount: number;
  data: SeoCrawlData;
  createdAt: string;
};
