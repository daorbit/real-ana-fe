import type {
  Workspace, Site, Goal, ApiKey, ShareState, SeoReport,
  SeoReportSummary, SeoCrawlReport, SeoCrawlPage, SeoSearchTraffic, SeoFieldVitals,
  SeoCompetitor, SeoShareState,
} from "@/shared/types";
import { demoStats } from "@/features/demo/demoStats";

/**
 * Everything the demo session shows, generated in the browser.
 *
 * The demo has no server presence at all: the backend only issues the token.
 * Every workspace, site, report and number below is fabricated here, so a
 * visitor exploring the product costs no database queries and can touch no real
 * data. Ids are stable so RTK's cache keys and the app's "active workspace"
 * memory behave exactly as they would against a real account.
 */

export const DEMO_WORKSPACE_ID = "demo-workspace";
export const DEMO_SITE_ID = "demo-site-acme";
export const DEMO_SITE_ID_2 = "demo-site-docs";
export const DEMO_REPORT_ID = "demo-report-1";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;


export const demoWorkspaces: Workspace[] = [
  {
    _id: DEMO_WORKSPACE_ID,
    name: "Acme Inc.",
    slug: "acme-inc",
    createdAt: iso(120 * DAY),
    // The demo visitor is looking at their "own" workspace, so every control is
    // visible — the write guard, not the role, is what stops them changing it.
    role: "owner",
    /**
     * On Pro, so the demo shows the product rather than the paywall: a Free
     * demo would hide 7d/30d ranges, funnels, and WhatsApp reports behind
     * upgrade prompts nobody can act on without an account.
     */
    billing: {
      workspaceId: DEMO_WORKSPACE_ID,
      plan: { slug: "pro", name: "Pro" },
      cycle: "monthly",
      status: "active",
      currentPeriodEnd: iso(-25 * DAY),
      audits: { planQuota: 50, used: 12, addonCredits: 0 },
      crawls: { planQuota: 50, used: 8, addonCredits: 0 },
      events: { planQuota: 2_000_000, used: 412_880 },
      sites: { quota: 2, used: 2 },
      maxSitesPerWorkspace: 2,
      allowedRanges: ["1h", "24h", "7d", "30d", "custom"],
      compareModes: ["previous", "yoy", "custom"],
      whatsappReports: true,
    },
  },
];

export const demoSites: Site[] = [
  {
    _id: "demo-site-doc-1",
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Acme Marketing",
    domain: "https://acme.example",
    framework: "react",
    siteId: DEMO_SITE_ID,
    createdAt: iso(118 * DAY),
  },
  {
    _id: "demo-site-doc-2",
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Acme Docs",
    domain: "https://docs.acme.example",
    framework: "other",
    siteId: DEMO_SITE_ID_2,
    createdAt: iso(90 * DAY),
  },
];

export const demoGoals: Goal[] = [
  { id: "demo-goal-1", name: "Signup", kind: "page", match: "/signup" },
  { id: "demo-goal-2", name: "Pricing viewed", kind: "page", match: "/pricing" },
  { id: "demo-goal-3", name: "Docs read", kind: "page", match: "/docs" },
];

export const demoApiKeys: ApiKey[] = [
  {
    id: "demo-key-1",
    name: "Production",
    // A prefix only — the demo shows the shape of a key, never a usable one.
    prefix: "qk_demo",
    lastUsedAt: iso(2 * 3_600_000),
    createdAt: iso(60 * DAY),
  },
];

export const demoShare: ShareState = {
  enabled: false,
  token: null,
  panels: {
    totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
    browsers: false, operatingSystems: false, entryPages: false, exitPages: false,
    languages: false, channels: false, engagement: false, visitorSplit: false,
  },
  views: 0,
  lastViewedAt: null,
};


const metaTags = [
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "description", content: "Acme ships developer tools teams actually enjoy using." },
  { name: "robots", content: "index, follow" },
  { name: "og:title", content: "Acme — developer tools that get out of the way" },
  { name: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "theme-color", content: "#10b981" },
];

const demoSeoData: any = {
  url: "https://acme.example/",
  finalUrl: "https://acme.example/",
  score: 88,
  meta: {
    title: "Acme — developer tools that get out of the way",
    description:
      "Acme ships developer tools teams actually enjoy using. Deploy in minutes, scale without the pager, and keep your data yours.",
    keywords: "developer tools, deployment, observability",
    author: "Acme Inc.",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
    charset: "utf-8",
    ogTitle: "Acme — developer tools that get out of the way",
    ogDescription: "Deploy in minutes, scale without the pager, and keep your data yours.",
    ogImage: "https://acme.example/og.png",
    ogUrl: "https://acme.example",
    ogType: "website",
    ogSiteName: "Acme",
    twitterTitle: "Acme — developer tools that get out of the way",
    twitterDescription: "Deploy in minutes, scale without the pager.",
    twitterImage: "https://acme.example/og.png",
    twitterCard: "summary_large_image",
    twitterSite: "@acme",
    canonical: "https://acme.example/",
    favicon: "https://acme.example/favicon.ico",
    allMetaTags: metaTags,
  },
  content: {
    h1Count: 1,
    h2Count: 7,
    h3Count: 14,
    imgCount: 12,
    linkCount: 48,
    wordCount: 1284,
    hasSchema: true,
    schemaTypes: ["Organization", "WebSite", "SoftwareApplication", "FAQPage"],
    internalLinks: 39,
    externalLinks: 9,
    headingStructure: [
      { level: 1, count: 1, texts: ["Developer tools that get out of the way"] },
      { level: 2, count: 7, texts: ["Deploy in minutes", "Scale without the pager", "Your data stays yours", "Built for teams", "Pricing", "FAQ"] },
      { level: 3, count: 14, texts: ["Zero-config builds", "Preview environments", "Rollbacks", "Audit logs", "SSO", "Usage-based pricing"] },
    ],
    keywordDensity: [
      { word: "deploy", count: 24, density: 1.9 },
      { word: "teams", count: 18, density: 1.4 },
      { word: "builds", count: 15, density: 1.2 },
      { word: "preview", count: 12, density: 0.9 },
      { word: "pricing", count: 9, density: 0.7 },
    ],
    readabilityScore: 64,
    contentQuality: 82,
    images: [
      { src: "https://acme.example/hero.png", alt: "The Acme dashboard showing a deploy in progress", hasAlt: true, width: 1440, height: 900, loading: "eager" },
      { src: "https://acme.example/logo.svg", alt: "Acme", hasAlt: true, width: 120, height: 32, loading: "lazy" },
      { src: "https://acme.example/chart.png", alt: "", hasAlt: false, width: 800, height: 420, loading: "lazy" },
    ],
  },
  technical: {
    statusCode: 200,
    contentType: "text/html; charset=utf-8",
    contentLength: "254118",
    server: "cloudflare",
    hasHttps: true,
    hasMobileViewport: true,
    hasFavicon: true,
    hasOpenGraph: true,
    hasTwitterCards: true,
    hasStructuredData: true,
    totalImages: 12,
    imageAltCount: 11,
    missingAltImages: 1,
    responseTimeMs: 412,
  },
  performance: {
    available: true,
    scores: { performance: 74, accessibility: 96, bestPractices: 92, seo: 100 },
    mobile: {
      strategy: "mobile",
      scores: { performance: 74, accessibility: 96, bestPractices: 92, seo: 100 },
      metrics: {
        firstContentfulPaint: 1720,
        speedIndex: 3180,
        largestContentfulPaint: 2980,
        interactive: 3620,
        totalBlockingTime: 240,
        cumulativeLayoutShift: 0.04,
      },
    },
    desktop: {
      strategy: "desktop",
      scores: { performance: 93, accessibility: 96, bestPractices: 92, seo: 100 },
      metrics: {
        firstContentfulPaint: 780,
        speedIndex: 1240,
        largestContentfulPaint: 1310,
        interactive: 1480,
        totalBlockingTime: 60,
        cumulativeLayoutShift: 0.02,
      },
    },
    suggestions: [
      {
        id: "largest-contentful-paint-element",
        title: "Largest Contentful Paint element is slow",
        category: "performance",
        score: 45,
        displayValue: "2.98 s",
        description: "The largest element on screen took nearly three seconds to render on mobile.",
        advice: "Preload the hero image and serve it as WebP. Estimated saving: 1.1 s.",
        resources: ["https://acme.example/hero.png"],
      },
      {
        id: "unused-javascript",
        title: "Reduce unused JavaScript",
        category: "performance",
        score: 58,
        displayValue: "142 KiB",
        description: "Some bundled scripts are not used on this page.",
        advice: "Code-split the analytics and chart bundles so they load on demand. Estimated saving: 0.6 s.",
        resources: ["https://acme.example/assets/vendor.js", "https://acme.example/assets/charts.js"],
      },
      {
        id: "render-blocking-resources",
        title: "Eliminate render-blocking resources",
        category: "performance",
        score: 66,
        displayValue: "0.4 s",
        description: "Stylesheets in the head delay the first paint.",
        advice: "Inline the critical CSS and defer the rest. Estimated saving: 0.4 s.",
        resources: ["https://acme.example/assets/main.css"],
      },
    ],
  },
  siteFiles: {
    robotsTxt: { present: true, url: "https://acme.example/robots.txt" },
    sitemap: { present: true, urls: ["https://acme.example/sitemap.xml"] },
  },
  schema: {
    blocks: [
      { index: 0, types: ["Organization", "WebSite", "SoftwareApplication", "FAQPage"], valid: true },
    ],
    types: ["Organization", "WebSite", "SoftwareApplication", "FAQPage"],
    findings: [
      {
        severity: "warning",
        type: "SoftwareApplication",
        property: "aggregateRating",
        message: 'SoftwareApplication has no "aggregateRating". It is optional, but the rich result carries less.',
      },
      {
        severity: "warning",
        type: "WebSite",
        property: "potentialAction",
        message: 'WebSite has no "potentialAction". It is optional, but the rich result is weaker without it.',
      },
    ],
    errorCount: 0,
    warningCount: 2,
  },
  links: {
    checked: 48,
    skipped: 0,
    broken: 1,
    serverErrors: 0,
    redirects: 3,
    timeouts: 0,
    results: [
      { url: "https://github.com/acme/old-repo", status: "broken", statusCode: 404, text: "Our GitHub", internal: false, chain: [], elapsedMs: 320 },
      { url: "https://acme.example/docs", status: "redirect", statusCode: 301, text: "Docs", internal: true, chain: ["https://acme.example/docs", "https://docs.acme.example/"], elapsedMs: 180 },
      { url: "https://acme.example/pricing", status: "ok", statusCode: 200, text: "Pricing", internal: true, chain: [], elapsedMs: 96 },
      { url: "https://twitter.com/acme", status: "ok", statusCode: 200, text: "Twitter", internal: false, chain: [], elapsedMs: 240 },
    ],
  },
  issues: [
    { severity: "critical", area: "technical", title: "Largest Contentful Paint is slow on mobile", detail: "LCP is 2.98 s. Google treats anything over 2.5 s as needing work — preload the hero image and serve it as WebP." },
    { severity: "warning", area: "content", title: "One image is missing alt text", detail: "A chart image has no alt attribute, so screen readers and search engines cannot tell what it shows." },
    { severity: "warning", area: "technical", title: "1 broken outbound link", detail: "A link to github.com/acme/old-repo returns 404. Visitors following it hit a dead end." },
    { severity: "info", area: "meta", title: "Structured data could be richer", detail: "Two recommended properties are missing from your SoftwareApplication and WebSite blocks." },
    { severity: "info", area: "files", title: "Sitemap could list more pages", detail: "The sitemap covers the main pages but omits several blog posts that are linked from the homepage." },
  ],
};

export const demoSeoReport: SeoReport = {
  _id: DEMO_REPORT_ID,
  siteId: DEMO_SITE_ID,
  url: "https://acme.example/",
  score: 88,
  scores: { performance: 74, accessibility: 96, bestPractices: 92, seo: 100 },
  issueCount: 5,
  criticalCount: 1,
  data: demoSeoData,
  createdAt: iso(3 * 3_600_000),
};

/** Past audits, newest first, so the trend chart and History tab have shape. */
export const demoSeoHistory: SeoReportSummary[] = [
  { _id: DEMO_REPORT_ID, siteId: DEMO_SITE_ID, url: "https://acme.example/", score: 88, scores: { performance: 74, accessibility: 96, bestPractices: 92, seo: 100 }, issueCount: 5, criticalCount: 1, createdAt: iso(3 * 3_600_000) },
  { _id: "demo-report-2", siteId: DEMO_SITE_ID, url: "https://acme.example/", score: 84, scores: { performance: 69, accessibility: 96, bestPractices: 92, seo: 100 }, issueCount: 7, criticalCount: 1, createdAt: iso(6 * DAY) },
  { _id: "demo-report-3", siteId: DEMO_SITE_ID, url: "https://acme.example/", score: 79, scores: { performance: 61, accessibility: 92, bestPractices: 85, seo: 96 }, issueCount: 9, criticalCount: 2, createdAt: iso(14 * DAY) },
  { _id: "demo-report-4", siteId: DEMO_SITE_ID, url: "https://acme.example/", score: 71, scores: { performance: 52, accessibility: 88, bestPractices: 85, seo: 92 }, issueCount: 12, criticalCount: 3, createdAt: iso(27 * DAY) },
];

export const demoSeoShare: SeoShareState = {
  enabled: false,
  token: null,
  panels: {
    summary: true, issues: true, technical: true, performance: true,
    meta: false, content: false, links: false, schema: false, aiSearch: false,
  },
  views: 0,
  lastViewedAt: null,
};

const crawlPage = (
  path: string,
  title: string | null,
  statusCode = 200,
  over: Partial<SeoCrawlPage> = {}
): SeoCrawlPage => ({
  url: `https://acme.example${path}`,
  path,
  statusCode,
  title,
  titleLength: title?.length ?? 0,
  description: title ? `${title} — Acme ships developer tools teams enjoy using.` : "",
  descriptionLength: title ? 62 : 0,
  h1Count: statusCode === 200 ? 1 : 0,
  wordCount: statusCode === 200 ? 620 + Math.round(path.length * 37) : 0,
  canonical: `https://acme.example${path}`,
  noindex: false,
  internalLinks: 24,
  externalLinks: 5,
  imagesMissingAlt: 0,
  hasSchema: true,
  responseTimeMs: 280 + path.length * 6,
  ...over,
});

export const demoCrawl: SeoCrawlReport = {
  _id: "demo-crawl-1",
  siteId: DEMO_SITE_ID,
  origin: "https://acme.example",
  score: 86,
  crawled: 24,
  discovered: 31,
  findingCount: 3,
  criticalCount: 1,
  createdAt: iso(2 * DAY),
  data: {
    startedAt: iso(2 * DAY),
    finishedAt: iso(2 * DAY - 90_000),
    discovered: 31,
    crawled: 24,
    score: 86,
    pages: [
      crawlPage("/", "Acme — developer tools that get out of the way"),
      crawlPage("/pricing", "Pricing — Acme"),
      crawlPage("/docs", "Documentation — Acme"),
      crawlPage("/blog", "Blog — Acme"),
      crawlPage("/blog/real-time-analytics", "Real-time analytics without the warehouse — Acme"),
      crawlPage("/about", "About — Acme"),
      crawlPage("/legacy", null, 404, { imagesMissingAlt: 0, hasSchema: false, error: "Not found" }),
      crawlPage("/changelog", "Changelog — Acme", 200, { imagesMissingAlt: 2 }),
    ],
    findings: [
      {
        severity: "critical",
        title: "A linked page returns 404",
        detail: "One page reached from the homepage no longer exists. Fix or remove the link so crawl budget isn't wasted.",
        pages: ["/legacy"],
      },
      {
        severity: "warning",
        title: "Images missing alt text",
        detail: "Two images on the changelog have no alt attribute.",
        pages: ["/changelog"],
      },
      {
        severity: "info",
        title: "Some pages are three clicks deep",
        detail: "Older blog posts sit far from the homepage, so they're crawled less often.",
        pages: ["/blog/privacy-first"],
      },
    ],
  },
};

export const demoSearchTraffic: SeoSearchTraffic = {
  visits: 4820,
  visitors: 3960,
  totalVisits: 12_400,
  engines: [
    { engine: "Google", visits: 4010, visitors: 3320 },
    { engine: "Bing", visits: 420, visitors: 350 },
    { engine: "DuckDuckGo", visits: 260, visitors: 214 },
    { engine: "Brave", visits: 130, visitors: 108 },
  ],
  landingPages: [
    { path: "/", visits: 2100, visitors: 1780 },
    { path: "/pricing", visits: 880, visitors: 742 },
    { path: "/docs", visits: 640, visitors: 553 },
    { path: "/blog/real-time-analytics", visits: 520, visitors: 471 },
  ],
  // Search engines stopped passing query terms in referrers years ago, so the
  // demo is honest about that rather than inventing keyword data.
  terms: [],
  hasTerms: false,
  days: 30,
};

const vital = (
  p75: number,
  rating: "good" | "needs-improvement" | "poor",
  good: number,
  needsImprovement: number,
  poor: number
) => ({ p75, p50: Math.round(p75 * 0.7), samples: 8420, good, needsImprovement, poor, rating });

export const demoVitals: SeoFieldVitals = {
  samples: 8420,
  days: 30,
  metrics: {
    lcp: vital(2410, "needs-improvement", 68, 24, 8),
    cls: vital(0.04, "good", 91, 7, 2),
    inp: vital(180, "good", 88, 9, 3),
    fcp: vital(1480, "good", 84, 12, 4),
    ttfb: vital(610, "good", 79, 16, 5),
  },
  byPage: [
    { path: "/", lcp: 2610, cls: 0.05, samples: 3120 },
    { path: "/pricing", lcp: 2180, cls: 0.02, samples: 1450 },
    { path: "/docs", lcp: 1940, cls: 0.03, samples: 1210 },
  ],
  trackerVersion: 5,
  requiredVersion: 5,
};

export const demoCompetitors: SeoCompetitor[] = [
  {
    _id: "demo-comp-1",
    siteId: DEMO_SITE_ID,
    label: "Rival",
    url: "https://rival.example/",
    lastCheckedAt: iso(1 * DAY),
    lastError: "",
    createdAt: iso(20 * DAY),
    snapshot: {
      url: "https://rival.example/",
      finalUrl: "https://rival.example/",
      fetchedAt: iso(1 * DAY),
      statusCode: 200,
      responseTimeMs: 640,
      pageBytes: 412_880,
      title: "Rival — ship faster, worry less",
      titleLength: 31,
      description: "Rival helps teams deploy quickly with managed infrastructure.",
      descriptionLength: 61,
      canonical: "https://rival.example/",
      h1Count: 1,
      h2Count: 5,
      wordCount: 940,
      imageCount: 8,
      imagesMissingAlt: 3,
      internalLinks: 28,
      externalLinks: 6,
      hasHttps: true,
      hasOpenGraph: true,
      hasTwitterCards: false,
      hasStructuredData: false,
      schemaTypes: [],
      schemaErrors: 0,
      score: 74,
    },
  },
];

/** Install status is per-site; the demo's sites are both "receiving events". */
export const demoInstallStatus = {
  installed: true,
  eventCount: 128_400,
  lastEventAt: iso(4 * 60_000),
};

/** Stats come from the existing generator, which already produces a full payload. */
export { demoStats };
