const SITE_URL = "https://quantalog.daorbit.in";

export const DOCS_BASE_URL = `${SITE_URL}/docs`;

export const CONTACT_URL = `${SITE_URL}/contact`;

export const DEMO_CALL_URL = "https://forms.daorbit.in/form/6accc4af7ffcc5038e50d43f/view";

export const LEGAL_URLS = {
  terms: `${SITE_URL}/terms`,
  privacy: `${SITE_URL}/privacy`,
  dpa: `${SITE_URL}/dpa`,
} as const;

export const DOCS_SLUGS = {
  overview: "/overview",
  demo: "/demo",
  billing: "/billing",
  referrals: "/referrals",
  tracking: "/tracking",
  mobileTracking: "/mobile-tracking",
  scriptOptions: "/script-options",
  customEvents: "/custom-events",
  filters: "/filters",
  comparisons: "/comparisons",
  funnels: "/funnels",
  retention: "/retention",
  channels: "/channels",
  conversions: "/conversions",
  goals: "/goals",
  outbound: "/outbound",
  errorTracking: "/error-tracking",
  exporting: "/exporting",
  dashboards: "/dashboards",
  publicDashboards: "/public-dashboards",
  seo: "/seo",
  quantalogCompare: "/quantalog-compare",
  searchVisibility: "/search-visibility",
  emailReports: "/email-reports",
  scheduledPosts: "/scheduled-posts",
  leadCapture: "/lead-capture",
  formsAiAndTheming: "/forms-ai-and-theming",
  formsEntriesAndLinks: "/forms-entries-and-links",
  formsAdvancedFields: "/forms-advanced-fields",
  formsBooking: "/forms-booking",
  formsNotificationsAndApps: "/forms-notifications-and-apps",
  formsGoogleSheets: "/forms-google-sheets",
  segmentsMarkers: "/segments-markers",
  orbitAi: "/orbit-ai",
  platformApi: "/platform-api",
  apiReference: "/api-reference",
  privacy: "/privacy",
  branding: "/branding",
  mediaLibrary: "/media-library",
  reviews: "/reviews",
  workspaceMembers: "/workspace-members",
} as const;

export type DocsSlug = (typeof DOCS_SLUGS)[keyof typeof DOCS_SLUGS];

export function docsUrl(slug?: DocsSlug): string {
  return `${DOCS_BASE_URL}${slug ?? ""}`;
}
