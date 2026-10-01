export const DOCS_BASE_URL = "https://quantalog.daorbit.in/docs";

export const CONTACT_URL = "https://quantalog.daorbit.in/contact";

export const DOCS_SLUGS = {
  overview: "/overview",
  demo: "/demo",
  billing: "/billing",
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
  outbound: "/outbound",
  errorTracking: "/error-tracking",
  exporting: "/exporting",
  publicDashboards: "/public-dashboards",
  seo: "/seo",
  searchVisibility: "/search-visibility",
  emailReports: "/email-reports",
  scheduledPosts: "/scheduled-posts",
  leadCapture: "/lead-capture",
  formsAiAndTheming: "/forms-ai-and-theming",
  formsEntriesAndLinks: "/forms-entries-and-links",
  formsAdvancedFields: "/forms-advanced-fields",
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
