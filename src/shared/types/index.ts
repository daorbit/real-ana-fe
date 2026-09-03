import type { TrackerOptions } from "@/features/workspace/tracker";

export type Role = "super_admin" | "admin" | "user";

export type User = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  avatarUrl: string;
  dateLocale: string;
  /** IANA zone, e.g. "Asia/Kolkata". Empty means "follow the browser". */
  timezone: string;
  role: Role;
  /** True once the account has signed in with Google at least once. */
  googleLinked?: boolean;
  /** True once the account has signed in with LinkedIn at least once. */
  linkedinLinked?: boolean;
  /** False on social-only accounts, which have never set a password. */
  hasPassword?: boolean;
  /**
   * How this account signs in: a password, or the provider it was created with.
   *
   * Derived on the server from what is actually linked, so it stays right for
   * accounts that predate the field.
   */
  signupSource?: "email" | "google" | "linkedin";
  /** True when this session is an admin acting as someone else. */
  impersonating?: boolean;
  /** True on the read-only public demo session. */
  demo?: boolean;
  // No billing field: a plan belongs to a workspace, not to an account. See
  // `Workspace.billing`.
  /**
   * Which workspaces this account can open, and its role in each.
   *
   * Identity-shaped, so it belongs on the profile: it answers "what can I
   * reach", not "what is this workspace". Deliberately thin — plans, usage,
   * sites and everything else come from `GET /api/workspaces`, which is the one
   * copy of that state.
   */
  workspaceAccess?: WorkspaceAccess[];
  /** Invitations addressed to this account that have not been accepted yet. */
  pendingInvites?: PendingInvite[];
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
 * Whether the signed-in account has a LinkedIn profile connected.
 *
 * Carries only what the Share Panel displays. The access token lives on the
 * server and is never part of this shape — see the status route.
 */
export type LinkedInStatus = {
  connected: boolean;
  /**
   * Whether the server has LinkedIn credentials at all. False on a deployment
   * where the client id/secret are unset — the panel says so rather than
   * offering a button whose only effect is to bounce the page back.
   */
  configured?: boolean;
  /**
   * Names of the server-side variables that are absent, when `configured` is
   * false. Names only — never values, and omitted once set up correctly.
   */
  missing?: string[];
  /**
   * The stored token has passed its expiry, or LinkedIn rejected it on the last
   * attempt. Still "connected", but the panel must offer Reconnect rather than
   * Post — the connection exists and cannot be used.
   */
  expired?: boolean;
  /**
   * Whether the granted token may publish.
   *
   * False for an account that signed in with LinkedIn but never granted the
   * publishing permission — signing in no longer asks for it, so this is a
   * normal state rather than an error.
   */
  canPublish?: boolean;
  profile?: {
    name: string;
    email: string;
    picture: string;
  };
};

/**
 * Whether this account has Instagram connected, and as whom.
 *
 * The same shape as `LinkedInStatus` above, minus the email: Instagram Login's
 * `instagram_business_basic` scope carries no address, so the profile is the
 * `@username` and the avatar and nothing else.
 */
export type InstagramStatus = {
  connected: boolean;
  /** Whether the server has Instagram credentials at all. */
  configured?: boolean;
  /** Names of absent server-side variables. Never values. */
  missing?: string[];
  /** The stored token has passed its 60-day life, or Instagram rejected it. */
  expired?: boolean;
  /**
   * Whether the granted token may publish.
   *
   * False when someone completed the consent screen but declined the publishing
   * permission on it — a real state, and one the card must offer to fix rather
   * than showing a working connection that cannot post.
   */
  canPublish?: boolean;
  profile?: {
    /** The handle, without the leading `@`. */
    username: string;
    picture: string;
  };
};

/** Which network a scheduled post publishes to. */
export type PostProvider = "linkedin" | "instagram";

/**
 * Where on the network a post lands. `story` is Instagram's alone — no
 * caption, one 9:16 image, and gone after 24 hours.
 */
export type PostFormat = "feed" | "story";

/** How often a scheduled post repeats. */
export type PostFrequency = "daily" | "weekly" | "monthly";

/**
 * How a post is timed.
 *
 * `once` is the ordinary case: a distinct post published at a moment the author
 * picked. `repeat` is for evergreen content and is the exception — the same
 * words republished on a cadence is what an audience reads as spam.
 */
export type PostMode = "once" | "repeat";

/**
 * A post written once and published on a schedule, to LinkedIn or Instagram.
 *
 * The content is authored here and stored whole — the caption as text, the
 * image already uploaded to Cloudinary. The server publishes it unchanged, so
 * what is composed on this page is exactly what goes out.
 */
export type ScheduledPost = {
  id: string;
  /**
   * The network this publishes to. Fixed at creation: the caption limit and the
   * image requirement differ between the two, so moving a post across is a
   * rewrite rather than a toggle.
   */
  provider: PostProvider;
  /** Optional: rows written before stories existed carry only feed posts. */
  format?: PostFormat;
  workspaceId: string;
  /** The user's own label for the schedule. Not published. */
  name: string;
  caption: string;
  /** The first image, or empty for a caption-only post. See `images`. */
  imageUrl: string;
  /**
   * Every image, in publish order — a carousel on Instagram, a multi-image
   * post on LinkedIn. Optional because rows written before carousels existed
   * carry only `imageUrl`.
   */
  images?: string[];
  mode: PostMode;
  /** The instant a one-off publishes. Null for a repeating post. */
  runAt: string | null;
  frequency: PostFrequency;
  hour: number;
  minute: number;
  timezone: string;
  /** 0-6, Sunday first. Weekly only. */
  weekday: number;
  /** 1-28. Monthly only. */
  dayOfMonth: number;
  /** `sent` is terminal, and only a one-off reaches it. */
  status: "active" | "paused" | "sent";
  nextRunAt: string;
  lastRunAt: string | null;
  lastStatus: "ok" | "failed" | "";
  /** Already written for display — never a raw LinkedIn error. */
  lastError: string;
  lastPostUrl: string;
  postCount: number;
  createdAt: string;
};

/**
 * The schedule list, with the connection state it depends on.
 *
 * The two travel together because a list of schedules is misleading alone:
 * without a live connection none of them can publish.
 */
/**
 * A connected publishing account, as the schedules list reports it.
 *
 * One shape for both networks so the composer's picker can read either without
 * special-casing. `name` is the member's name on LinkedIn and the `@username`
 * on Instagram — in both cases, what to show as "posting as".
 */
export type PostAccount = {
  connected: boolean;
  expired: boolean;
  name: string;
  picture?: string;
  /** False when the connection exists but was never granted posting rights. */
  canPublish?: boolean;
};

export type ScheduledPostsResponse = {
  posts: ScheduledPost[];
  linkedin: PostAccount;
  instagram: PostAccount;
};

/**
 * Engagement on a published post.
 *
 * Every figure is nullable, and that is the point rather than an oversight. A
 * post published minutes ago has no impressions *yet*; a post this application
 * has no permission to measure never will. Both are "not known", which the UI
 * renders as a dash — showing 0 would state that nobody saw it, which is a
 * different and usually false claim.
 */
export type PostStats = {
  impressions: number | null;
  /** Distinct members reached, which LinkedIn counts separately from impressions. */
  uniqueImpressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
  /** A fraction: 0.05 renders as "5%". LinkedIn's own figure, not recomputed. */
  engagement: number | null;
  fetchedAt: string | null;
  /**
   * Why there are no figures, when there are none.
   *
   * `scope` — this deployment has no analytics permission, so LinkedIn was
   * never asked. `pending` — asked, and it had nothing yet, which is normal for
   * the first hour after publishing. Empty means the numbers above are real.
   */
  unavailable: "" | "scope" | "pending" | "error";
};

/**
 * One post, as actually published.
 *
 * Distinct from `ScheduledPost`, which is the *instruction* to publish and
 * carries only its most recent outcome. This is history: a row per publish,
 * with the caption and image as they went out rather than as the schedule reads
 * today, so editing a schedule cannot rewrite what it already posted.
 */
export type SentPost = {
  id: string;
  /** Which network it went out on. */
  provider: PostProvider;
  /** Optional: rows written before stories existed carry only feed posts. */
  format?: PostFormat;
  /** The schedule behind it, when there was one. Null for a Share Panel post. */
  scheduledPostId: string | null;
  workspaceId: string | null;
  name: string;
  caption: string;
  imageUrl: string;
  /** How it came to be published: on its schedule, by hand, or from the panel. */
  source: "schedule" | "manual" | "share";
  status: "published" | "failed";
  /** Already written for display — never a raw LinkedIn error. */
  error: string;
  postUrl: string;
  publishedAt: string;
  stats: PostStats;
};

/**
 * A page of published history, newest first.
 *
 * Cursor-paginated rather than by page number: rows are appended continuously,
 * and an offset would skip or repeat a post whenever one published between two
 * requests.
 */
export type SentPostsResponse = {
  posts: SentPost[];
  /** Pass back as `cursor` for the next page. Null when there are no more. */
  nextCursor: string | null;
  /** The connected account every row published as. */
  author: { name: string; picture: string } | null;
  /**
   * Whether the stats columns can ever hold a number.
   *
   * False wherever the LinkedIn app has no product granting post analytics —
   * which is everywhere, today. The UI reads this to show dashes and say why,
   * rather than five zeroes that read as a post nobody saw.
   */
  statsAvailable: boolean;
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
  monthlyAuditQuota: number;
  monthlyCrawlQuota: number;
  features: string[];
};

/**
 * An Orbit AI tier.
 *
 * A separate ladder from `Plan`: bought per workspace like a plan, but
 * independently of one, so a workspace carries both at once. Everything except
 * price is fixed in backend code (`src/orbit-plans.ts`).
 */
export type OrbitPlan = {
  slug: string;
  name: string;
  description: string;
  priceMonthly: CurrencyPrices;
  priceYearly: CurrencyPrices;
  /** Questions per billing cycle. */
  monthlyQuota: number;
  /** The highest model tier this plan may reach. */
  modelTier: "basic" | "standard" | "advanced";
  maxHistoryTurns: number;
  maxQuestionChars: number;
  hourlyBurst: number;
  /** Whether answers may read the workspace's own analytics. */
  dataAccess: boolean;
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
  include: { analytics: boolean; seo: boolean; dashboardLink: boolean; aiSummary?: boolean };
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
  include: { analytics: boolean; seo: boolean; dashboardLink: boolean; aiSummary?: boolean };
  attachXlsx: boolean;
  enabled?: boolean;
};

export type BillingCycle = "monthly" | "yearly";

/** Mirrors `ADDON_TYPES` on the server. A type missing here is a pack the UI cannot render. */
export type AddonType = "audit" | "crawl" | "orbit" | "post-slots" | "form-submissions";

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

/**
 * Sites one workspace may hold, on every plan. Mirrors the server constant of
 * the same name — the cap is flat across tiers because a workspace is the
 * billable unit, so more sites means another workspace, not a bigger plan.
 */
export const MAX_SITES_PER_WORKSPACE = 2;

export type QuotaSummary = {
  workspaceId: string;
  plan: { slug: string; name: string };
  /** The plan that lapsed, when one has. Null while the period is live. */
  lapsedPlan: { slug: string; name: string } | null;
  cycle: BillingCycle;
  status: "active" | "expired";
  currentPeriodEnd: string | null;
  audits: { planQuota: number; used: number; addonCredits: number };
  crawls: { planQuota: number; used: number; addonCredits: number };
  sites: { quota: number; used: number; addonSlots?: number };
  /**
   * The Orbit AI tier this workspace is effectively on, and its question usage.
   *
   * The tier is whatever is strongest between what the analytics plan grants
   * and anything bought on top, so this is not always the plan above — a
   * workspace can be on analytics Starter and Orbit Pro. Optional because a
   * subscription row written before Orbit existed has no figures to report.
   */
  orbit?: {
    plan: { slug: string; name: string };
    tier: "basic" | "standard" | "advanced";
    planQuota: number;
    used: number;
    addonCredits: number;
    periodEnd: string | null;
    dataAccess: boolean;
  };
  /**
   * Analytics events ingested this cycle. No addon credits — events are not
   * sold as a top-up, so the only way past the line is a plan change.
   */
  events: { planQuota: number; used: number };
  /**
   * Scheduled social posts still queued, and how many this workspace may hold.
   *
   * `quota` already includes any slots bought as an add-on, so the composer
   * compares two numbers and needs to know nothing about packs. Optional
   * because a subscription row written before this existed reports no figures.
   */
  scheduledPosts?: { quota: number; used: number; repeatingAllowed: boolean };
  /**
   * Lead capture allowances. `quota` caps how many forms may exist; the
   * submission figures are the per-cycle meter for responses received.
   *
   * How many forms *do* exist is absent on purpose: the forms service owns
   * those rows, and asking it on every billing page load would make this panel
   * depend on another service being up.
   *
   * Optional for the same reason as `scheduledPosts` — a subscription row
   * written before this existed reports no figures.
   */
  forms?: {
    quota: number;
    submissionQuota: number;
    submissionsUsed: number;
    addonCredits: number;
    notificationEmails: boolean;
    fileUploads: boolean;
  };
  maxSitesPerWorkspace: number;
  /** Analytics date ranges this plan may query — everything else needs an upgrade. */
  allowedRanges: ("1h" | "24h" | "7d" | "30d" | "custom")[];
  /** Comparison baselines this plan may pick. Every tier keeps "previous". */
  compareModes: CompareMode[];
  /** Whether reports may be delivered over WhatsApp. Pro only. */
  whatsappReports: boolean;
} | null;

/**
 * One workspace and the plan it is on, as the admin console reads it for
 * another account. The dashboard's own workspaces carry this inline — see
 * `Workspace.billing`.
 */
export type WorkspaceBilling = {
  workspaceId: string;
  name: string;
  slug: string;
  billing: QuotaSummary;
};

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
  /** Empty when the account never set a picture — the row falls back to initials. */
  avatarUrl: string;
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

/**
 * Full billing detail for one account, shown in the admin plan dialog.
 *
 * A list, not a single plan: billing is per workspace, so an account can hold
 * several plans at once. `subscribed` is false when none of its workspaces has
 * a plan row at all (including an account that owns no workspaces).
 */
export type AdminUserBilling = {
  subscribed: boolean;
  workspaces: WorkspaceBilling[];
};

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

 
export type MailLayout = "plain" | "invite" | "install" | "welcome" | "feature";

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
  /**
   * The caller's own role in this workspace, which decides what the client
   * offers them. The server enforces the same limits again — this is what
   * stops a viewer being shown buttons that would only fail.
   */
  role: WorkspaceRole;
  /**
   * The plan this workspace is on, and its usage against it.
   *
   * Carried by the workspace rather than the profile because a plan is bought
   * per workspace — and because a workspace reachable by someone who does not
   * own it still has a plan, which no account-level field could describe.
   *
   * Null for a workspace with no subscription row, which shouldn't happen since
   * creating one assigns Free.
   */
  billing: QuotaSummary;
};

/**
 * A person's role within one workspace, strongest first.
 *
 * Mirrors the server's `WORKSPACE_ROLES`. Cumulative: every editor power is
 * also an admin power, so `canEdit`-style checks compare rank rather than
 * enumerating roles.
 */
export const WORKSPACE_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Role strength. Higher wins — mirrors the server's `ROLE_RANK`. */
export const ROLE_RANK: Record<WorkspaceRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

/**
 * A workspace this account can open, as the profile reports it.
 *
 * Just enough to know it exists and what may be done in it. The full object —
 * plan, usage, share state — comes from the workspace API.
 */
export type WorkspaceAccess = {
  workspaceId: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
};

/**
 * An invitation waiting for this account.
 *
 * Kept apart from `workspaceAccess` because it is not access: nothing can be
 * opened until it is accepted. `token` links straight to the accept page.
 */
export type PendingInvite = {
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
  token: string;
  expiresAt: string;
};

/** One person's access to a workspace, as the members list shows it. */
export type WorkspaceMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: WorkspaceRole;
  joinedAt: string;
  /** True for the signed-in user's own row — they can leave, but not remove themselves. */
  isSelf: boolean;
};

/** An invitation that has been sent but not yet accepted. */
export type WorkspaceInvite = {
  id: string;
  email: string;
  role: WorkspaceRole;
  invitedAt: string;
  expiresAt: string;
};

export type MembersResponse = {
  /** The caller's own role, so the page knows which controls to render. */
  role: WorkspaceRole;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
};

/** What an invite link is for, readable before signing in. */
export type InvitePreview = {
  workspaceName: string;
  inviterName: string;
  email: string;
  role: WorkspaceRole;
  /** False when the invited address has no account — the page offers signup. */
  hasAccount: boolean;
};

export type Site = {
  _id: string;
  workspaceId: string;
  name: string;
  /** "app" sites are tracked by the mobile SDK against appUserId, not a domain. */
  platform?: "web" | "app";
  domain: string;
  framework: string;
  /** iOS bundle id / Android package name — app sites only. */
  bundleId?: string;
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

/** Which period the current window's deltas are measured against. */
export type CompareMode = "previous" | "yoy" | "custom";

/**
 * The baseline period behind `Stats.deltas`.
 *
 * Carries the raw counters as well as the bounds, so a tile can say what it is
 * comparing to rather than only how far the number moved.
 */
export type Comparison = {
  mode: CompareMode;
  since: string;
  until: string;
  pageviews: number;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionMs: number;
  avgTimeOnPageMs: number;
  pagesPerSession: number;
  /** Only populated when a non-default baseline was requested. */
  timeseries: Point[] | null;
};

/** One row of a breakdown compared across both periods. */
export type BreakdownComparisonRow = {
  key: string;
  count: number;
  previous: number;
  delta: number | null;
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

  /** The baseline `deltas` were measured against. */
  comparison: Comparison;

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
  utmMediums: Bucket[];
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
  utmMedium: string;
  utmCampaign: string;
  eventName: string;
}>;

/**
 * A saved filter, so a view someone checks weekly doesn't have to be rebuilt
 * by hand every time.
 */
export type Segment = {
  id: string;
  name: string;
  filter: StatsFilter;
  /** Pinned segments show as one-click chips; the rest live behind the menu. */
  pinned: boolean;
  createdAt: string;
};

/** What a marker represents. Drives its colour and icon on the chart. */
export type MarkerKind = "deploy" | "campaign" | "incident" | "note";

/**
 * A moment drawn over the charts — a deploy, a campaign, an incident.
 *
 * Turns "traffic fell on Tuesday" into "traffic fell after Tuesday's release".
 */
export type Marker = {
  id: string;
  label: string;
  description: string;
  kind: MarkerKind;
  /** When it happened, not when it was recorded. */
  at: string;
  /** Empty means every site in the workspace. */
  siteIds: string[];
};

/**
 * A recently active identified user — traced via the workspace's Platform
 * API key from a real web or mobile app, not the anonymous landing-page
 * tracker. This is the row a journey list shows before drilling into one
 * user's timeline.
 */
export type JourneyUser = {
  appUserId: string;
  lastSeen: string;
  firstSeen: string;
  lastAction: string;
  siteId: string;
  eventCount: number;
  sessionCount: number;
};

/** One step of a user's journey: what happened, and where it went. */
export type JourneyEvent = {
  siteId: string;
  action: string;
  src: string;
  dest: string;
  /** Groups steps into visits, so a journey reads as sessions not one list. */
  sessionId?: string;
  ts: string;
};

/** One step a user defines in the funnel builder. */
export type FunnelStepInput = { type: "page" | "event"; value: string };

/** A named funnel definition saved for reuse. */
export type SavedFunnel = { id: string; name: string; steps: FunnelStepInput[] };

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

/** One page in the navigation graph, with how many sessions visited it. */
export type FlowNode = { id: string; count: number };
/** One A -> B transition in the navigation graph, with how many sessions took it. */
export type FlowEdge = { source: string; target: string; count: number };

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
  area: "meta" | "content" | "technical" | "files" | "ai";
  title: string;
  detail: string;
};

/** How one AI crawler is treated by the site's robots.txt. */
export type AiCrawlerAccess = {
  label: string;
  /** The literal User-agent token, e.g. "GPTBot". */
  agent: string;
  /**
   * Training bots feed a model; answer bots fetch pages to cite live. Blocking
   * the first is an editorial choice, blocking the second removes the page from
   * AI answers — so the UI must not present them the same way.
   */
  purpose: "training" | "answers" | "both";
  allowed: boolean;
  /** True when robots.txt names this agent rather than it falling to `*`. */
  explicit: boolean;
};

/** Whether answer engines can reach the page, and can quote what they find. */
export type SeoAiSearch = {
  score: number;
  crawlers: AiCrawlerAccess[];
  blockedCount: number;
  llmsTxt: {
    present: boolean;
    url: string;
    bytes: number;
    title: string;
    linkCount: number;
  };
  answerReadiness: {
    quotableSchemaTypes: string[];
    hasFaqSchema: boolean;
    hasArticleSchema: boolean;
    hasOrganizationSchema: boolean;
    questionHeadings: number;
    hasAuthor: boolean;
    hasDate: boolean;
    structuredBlocks: number;
    wordCount: number;
  };
  findings: SeoFileFinding[];
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
  /** AI search readiness. Absent on reports stored before the checker shipped. */
  aiSearch?: SeoAiSearch;
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
  aiSearch: boolean;
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
  aiSearch: SeoAiSearch | null;
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

  /* --- richer fields; absent on snapshots taken before they shipped --- */

  /** The H1-H3 outline in document order — how the page argues its case. */
  headings?: { level: number; text: string }[];
  /** The `robots` meta directive, lowercased. Empty when absent. */
  metaRobots?: string;
  /** True when the canonical points somewhere other than the fetched URL. */
  canonicalMismatch?: boolean;
  hreflangs?: string[];
  /** Most frequent meaningful words, for overlap against your own page. */
  keywords?: { word: string; count: number }[];
  hasMobileViewport?: boolean;
  /** Rendered text bytes over total HTML bytes, as a percentage. */
  textRatio?: number;

  score: number;
};

/** Which side of a comparison a metric favours. */
export type SeoCompareVerdict = "win" | "lose" | "tie";

export type SeoMetricComparison = {
  id: string;
  label: string;
  mine: string;
  theirs: string;
  verdict: SeoCompareVerdict;
  /** Why the metric matters. Present only on rows you are losing. */
  note?: string;
  /**
   * Why a row showing two different numbers is nonetheless a tie. Absent on
   * exact matches, where there is nothing to explain.
   */
  tieReason?: string;
  /** Share of the on-page score this signal can move, 0-1. */
  weight: number;
  /** `weight` scaled by how far apart the pages are, 0-1. Zero unless losing. */
  impact: number;
};

/** Everything the server worked out about one competitor versus your page. */
export type SeoCompetitorGap = {
  /** Positive means they are ahead of you. */
  scoreGap: number;
  metrics: SeoMetricComparison[];
  missingKeywords: string[];
  missingSchemaTypes: string[];
  contentGaps: string[];
  /** The highest-value changes, already ordered. */
  recommendations: string[];
};

/** One competitor inside the analysis payload. */
export type SeoCompetitorComparison = {
  competitorId: string;
  label: string;
  url: string;
  lastCheckedAt: string | null;
  snapshot: SeoCompareSnapshot;
  gap: SeoCompetitorGap;
};

/**
 * Your latest audit against every tracked competitor.
 *
 * Computed server-side so the page and Orbit cannot disagree about who is
 * winning.
 */
/** A rival immediately above or below you in the standings. */
export type SeoStandingsNeighbour = {
  label: string;
  competitorId: string;
  /** Always positive — the direction is implied by which field this sits in. */
  gap: number;
};

/**
 * Where you sit in the tracked field.
 *
 * A per-competitor delta answers "am I ahead of them", which stops being the
 * question once more than one rival is tracked.
 */
export type SeoCompetitivePosition = {
  rank: number;
  /** Competitors plus you, so rank reads as "N of fieldSize". */
  fieldSize: number;
  /** Share of tracked rivals you beat, 0-100. */
  percentile: number;
  /** Whoever leads the field. Null when that is you. */
  leader: string | null;
  gapToLeader: number;
  /** The competitor immediately above — the winnable fight. */
  nextUp: SeoStandingsNeighbour | null;
  /** The one immediately below, so a lead reads as safe or precarious. */
  closestBehind: SeoStandingsNeighbour | null;
};

export type SeoCompetitorAnalysis = {
  mine: SeoCompareSnapshot;
  auditedAt: string;
  competitors: SeoCompetitorComparison[];
  /** Whoever leads by the most — the one worth reading first. */
  toughest: string | null;
  /** Standings across the whole field, not just against one rival. */
  position: SeoCompetitivePosition;
};

/**
 * The AI reading of one comparison.
 *
 * Interpretation of the measured gaps, not new facts about the competitor —
 * the server only ever hands the model numbers it computed itself.
 */
export type SeoCompetitorBrief = {
  /** One sentence on where they are genuinely beating you. */
  headline: string;
  /** What their page appears built to do, read off the measured signals. */
  theirStrategy: string;
  /** The single highest-return change, and why it beats the alternatives. */
  topMove: string;
  /** What you are already winning. */
  yourEdge: string;
};

export type SeoCompetitorBriefResponse = {
  brief: SeoCompetitorBrief;
  /** Which model wrote it, so the panel can attribute the reading. */
  model: string;
  generatedAt: string;
};

/** One recorded refresh, for plotting a competitor's score over time. */
export type SeoCompetitorHistoryPoint = {
  competitorId: string;
  score: number;
  wordCount: number;
  responseTimeMs: number;
  statusCode: number;
  takenAt: string;
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
