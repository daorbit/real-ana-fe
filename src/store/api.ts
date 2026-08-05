import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getToken, isDemoToken } from "../api";
import { notify, errMessage } from "../notify";
import { resolveDemoRequest } from "../utils/demoResolver";
import type {
  AdminUserPage, AdminUserBilling, ApiKey, Site, Stats, Workspace, Role,
  ContactMessage, ContactMessagePage, ContactStatus,
  FunnelStepInput, FunnelResultStep, RetentionCohort, Goal,
  EmailStatus, EmailSegment, EmailSegmentId, EmailRecipient, EmailSendResult, MailTemplate,
  MailLayout,
} from "../types";
import type { Placed } from "../hooks/useHomeWidgets";
import type { TrackerOptions } from "../utils/tracker";
import type {
  ShareState, SharePanels, SeoReport, SeoReportSummary, SeoCompetitor,
  SeoSearchTraffic, SeoFieldVitals, SeoCrawlReport,
  SeoShareState, SeoSharePanels, PublicSeoReport,
  DemoUsage,
  Plan, AddonPack, BillingCycle, Currency, CurrencyPrices, FxStatus, FxSnapshot,
  ReportSchedule, ReportScheduleInput, WhatsAppStatus,
  StartSubscriptionResponse, StartAddonPurchaseResponse,
  Coupon, CouponCheckResult, Invoice,
} from "../types";

const BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * One cache for every server resource.
 *
 * RTK Query dedupes concurrent requests for the same key, keeps the result in
 * the store, and serves it instantly on the next mount — so navigating between
 * pages no longer refires the same calls. Data only goes stale when a poll
 * fires, a mutation invalidates its tag, or the user hits Refresh.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});


/**
 * The plan and addon catalogue, which a demo session reads from the server like
 * anyone else.
 *
 * This is the one exception to the demo's "never hit the network" rule, and it
 * earns it: prices are set per deployment and live only in the database, so a
 * fixture would have to invent them — and invented prices shown on a pricing
 * page are worse than a request. The data is public, read-only, and identical
 * for every visitor. Buying still goes nowhere: checkout is a write, and writes
 * are refused above.
 */
const DEMO_LIVE_READS = ["/api/billing/plans", "/api/billing/addons"];

function isPublicCatalogue(url: string, isWrite: boolean): boolean {
  if (isWrite) return false;
  const path = url.split("?")[0];
  return DEMO_LIVE_READS.includes(path);
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiArg,
  extra
) => {
  const method = typeof args === "string" ? "GET" : args.method ?? "GET";
  const url = typeof args === "string" ? args : args.url;
  const isWrite = method.toUpperCase() !== "GET";

  if (isDemoToken() && !isPublicCatalogue(url, isWrite)) {
    // A demo session is served entirely from generated fixtures. Nothing goes
    // to the server: browsing the product costs no queries, and there is no
    // real account behind the numbers to protect.
    if (isWrite) {
      notify.info("You're in demo mode — changes are turned off here.", "Read-only demo");
      return Promise.resolve({
        error: { status: 403, data: { error: "demo mode is read-only" } } as FetchBaseQueryError,
      });
    }
    const data = resolveDemoRequest(url);
    // An unmapped read resolves empty rather than falling through to the
    // network — a demo must never be the reason a request goes out.
    //
    // Empty is `undefined`, not `null`: a call site's `data = []` default only
    // fires on `undefined`, so `null` would sail past it and reach code that
    // expects an array. An unmapped endpoint should degrade to a bare page, not
    // crash it.
    return Promise.resolve({ data: data ?? undefined });
  }

  const result = await rawBaseQuery(args, apiArg, extra);

  // A plan/quota limit hit anywhere in the app — workspace, site, audit,
  // crawl, analytics range, whatever comes next — surfaces the same upgrade
  // dialog automatically. This is the one place every request passes
  // through, so a call site doesn't have to remember to check for
  // `quota_exceeded` itself; it only has to set the code server-side.
  const code = (result.error?.data as { code?: unknown } | undefined)?.code;
  if (code === "quota_exceeded") {
    notify.quotaLimit(errMessage(result.error, "Upgrade your plan to continue."));
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Workspace", "Site", "Stats", "ApiKey", "InstallStatus", "Layout", "AdminUser", "Goal", "Share", "Seo", "Competitor", "DemoUsage", "EmailSegment", "Plan", "AddonPack", "Billing", "Coupon", "Fx", "ReportSchedule", "ContactMessage"],
  // Hold a cached entry for 5 minutes after the last component stops using it.
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /* ----------------------------- workspaces ----------------------------- */
    getWorkspaces: build.query<Workspace[], void>({
      query: () => "/api/workspaces",
      providesTags: (result) => [
        "Workspace",
        ...(result ?? []).map((w) => ({ type: "Workspace" as const, id: w._id })),
      ],
    }),

    createWorkspace: build.mutation<Workspace, { name: string }>({
      query: (body) => ({ url: "/api/workspaces", method: "POST", body }),
      invalidatesTags: ["Workspace"],
    }),

    renameWorkspace: build.mutation<Workspace, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/api/workspaces/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["Workspace"],
    }),

    deleteWorkspace: build.mutation<void, string>({
      query: (id) => ({ url: `/api/workspaces/${id}`, method: "DELETE" }),
      // Deleting a workspace takes its sites and their analytics with it.
      invalidatesTags: ["Workspace", "Site", "Stats"],
    }),

    /* ------------------------------- sharing ------------------------------ */
    getShare: build.query<ShareState, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/share`,
      providesTags: (_r, _e, workspaceId) => [{ type: "Share", id: workspaceId }],
    }),

    setShare: build.mutation<
      ShareState,
      {
        workspaceId: string;
        enabled: boolean;
        rotate?: boolean;
        panels?: SharePanels;
      }
    >({
      query: ({ workspaceId, enabled, rotate, panels }) => ({
        url: `/api/workspaces/${workspaceId}/share`,
        method: "PUT",
        body: { enabled, rotate, panels },
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Share", id: workspaceId },
      ],
    }),

    /* -------------------------------- sites ------------------------------- */
    getSites: build.query<Site[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/sites`,
      providesTags: (result, _e, workspaceId) => [
        { type: "Site", id: `LIST-${workspaceId}` },
        ...(result ?? []).map((s) => ({ type: "Site" as const, id: s.siteId })),
      ],
    }),

    createSite: build.mutation<
      Site,
      {
        workspaceId: string;
        name: string;
        domain: string;
        framework?: string;
        trackerOptions?: TrackerOptions;
      }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/sites`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Site", id: `LIST-${workspaceId}` },
        "Stats",
      ],
    }),

    updateSiteOptions: build.mutation<
      Site,
      { workspaceId: string; siteId: string; options: TrackerOptions }
    >({
      query: ({ workspaceId, siteId, options }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/options`,
        method: "PATCH",
        body: options,
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Site", id: `LIST-${workspaceId}` },
      ],
    }),

    deleteSite: build.mutation<void, { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Site", id: `LIST-${workspaceId}` },
        "Stats",
      ],
    }),

    /* ------------------------------ analytics ----------------------------- */
    getStats: build.query<
      Stats,
      { workspaceId: string; range: string; filter?: string; sites?: string[]; from?: string; to?: string }
    >({
      query: ({ workspaceId, range, filter, sites, from, to }) => {
        const qs = new URLSearchParams({ range });
        if (filter) qs.set("filter", filter);
        // Empty selection means "all sites" — the server defaults to that when
        // the param is absent, so only send it when a subset is chosen.
        if (sites && sites.length) qs.set("sites", sites.join(","));
        if (range === "custom" && from && to) {
          qs.set("from", from);
          qs.set("to", to);
        }
        return `/api/workspaces/${workspaceId}/stats?${qs.toString()}`;
      },
      providesTags: (_r, _e, { workspaceId, range, filter, sites, from, to }) => [
        {
          type: "Stats",
          id: `${workspaceId}-${range}-${filter ?? ""}-${(sites ?? []).join(",")}-${from ?? ""}-${to ?? ""}`,
        },
      ],
    }),

    getInstallStatus: build.query<
      { installed: boolean; eventCount: number; lastEventAt: string | null },
      { workspaceId: string; siteId: string }
    >({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/status`,
      providesTags: (_r, _e, { siteId }) => [{ type: "InstallStatus", id: siteId }],
    }),

    computeFunnel: build.mutation<
      { steps: FunnelResultStep[] },
      { workspaceId: string; steps: FunnelStepInput[]; range: string; sites?: string[] }
    >({
      query: ({ workspaceId, steps, range, sites }) => ({
        url: `/api/workspaces/${workspaceId}/funnel`,
        method: "POST",
        body: { steps, range, ...(sites && sites.length ? { sites } : {}) },
      }),
    }),

    getRetention: build.query<
      { weeks: number; cohorts: RetentionCohort[] },
      { workspaceId: string; weeks?: number; sites?: string[] }
    >({
      query: ({ workspaceId, weeks = 6, sites }) => {
        const qs = new URLSearchParams({ weeks: String(weeks) });
        if (sites && sites.length) qs.set("sites", sites.join(","));
        return `/api/workspaces/${workspaceId}/retention?${qs.toString()}`;
      },
      providesTags: (_r, _e, { workspaceId, sites }) => [
        { type: "Stats", id: `retention-${workspaceId}-${(sites ?? []).join(",")}` },
      ],
    }),

    /* ------------------------------- layout ------------------------------- */
    // `layout: null` means the workspace has never been customised, which is
    // different from an empty array (every widget removed on purpose).
    getLayout: build.query<{ layout: Placed[] | null }, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/layout`,
      providesTags: (_r, _e, workspaceId) => [{ type: "Layout", id: workspaceId }],
    }),

    saveLayout: build.mutation<
      { layout: Placed[] },
      { workspaceId: string; layout: Placed[] }
    >({
      query: ({ workspaceId, layout }) => ({
        url: `/api/workspaces/${workspaceId}/layout`,
        method: "PUT",
        body: layout,
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Layout", id: workspaceId },
      ],
    }),

    /* -------------------------------- admin ------------------------------- */
    getAdminUsers: build.query<
      AdminUserPage,
      { q?: string; role?: string; page?: number }
    >({
      query: ({ q, role, page }) => {
        const p = new URLSearchParams();
        if (q) p.set("q", q);
        if (role) p.set("role", role);
        if (page && page > 1) p.set("page", String(page));
        const qs = p.toString();
        return `/api/admin/users${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminUser"],
    }),

    deleteAdminUser: build.mutation<{ ok: true }, string>({
      query: (userId) => ({ url: `/api/admin/users/${userId}`, method: "DELETE" }),
      invalidatesTags: ["AdminUser"],
    }),

    /** Grant or revoke admin on another account. Superadmin-only server-side. */
    setAdminUserRole: build.mutation<{ id: string; email: string; role: Role }, { userId: string; role: Role }>({
      query: ({ userId, role }) => ({ url: `/api/admin/users/${userId}/role`, method: "PUT", body: { role } }),
      invalidatesTags: ["AdminUser"],
    }),

    getAdminUserBilling: build.query<AdminUserBilling, string>({
      query: (userId) => `/api/admin/users/${userId}/billing`,
    }),

    /** Support request raised from inside the app. Identity comes from the
     *  session server-side, so nothing about the sender is passed here. */
    sendSupportMessage: build.mutation<
      { ok: true },
      { kind: "support" | "bug" | "feedback"; message: string; pageUrl: string }
    >({
      query: (body) => ({ url: "/api/support", method: "POST", body }),
      invalidatesTags: ["ContactMessage"],
    }),

    /* --------------------------- contact inbox ---------------------------- */
    getContactMessages: build.query<
      ContactMessagePage,
      { status?: string; q?: string; page?: number; source?: string }
    >({
      query: ({ status, q, page, source }) => {
        const p = new URLSearchParams();
        if (status) p.set("status", status);
        if (source) p.set("source", source);
        if (q) p.set("q", q);
        if (page && page > 1) p.set("page", String(page));
        const qs = p.toString();
        return `/api/admin/contact${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ContactMessage"],
    }),

    /** Just the badge count. The list query is far too heavy to poll for it. */
    getContactUnread: build.query<{ unread: number }, void>({
      query: () => "/api/admin/contact/unread",
      providesTags: ["ContactMessage"],
    }),

    updateContactMessage: build.mutation<
      ContactMessage,
      { id: string; status?: ContactStatus; adminNote?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/contact/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ContactMessage"],
    }),

    deleteContactMessage: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/contact/${id}`, method: "DELETE" }),
      invalidatesTags: ["ContactMessage"],
    }),

    /** Send a reply from the dashboard. The server mails it, then records it. */
    replyToContactMessage: build.mutation<
      ContactMessage,
      { id: string; subject: string; body: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/contact/${id}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContactMessage"],
    }),

    /* ---------------------------- admin email ----------------------------- */
    getEmailStatus: build.query<EmailStatus, void>({
      query: () => "/api/admin/email/status",
    }),

    getEmailTemplates: build.query<{ templates: MailTemplate[] }, void>({
      query: () => "/api/admin/email/templates",
    }),

    previewEmail: build.mutation<
      { subject: string; html: string; sampleName: string },
      {
        subject: string;
        body: string;
        userId?: string;
        /** Render as a recipient with no name on file — the usual case for invites. */
        anonymous?: boolean;
        cta?: { label: string; href: string };
        layout?: MailLayout;
      }
    >({
      query: (payload) => ({ url: "/api/admin/email/preview", method: "POST", body: payload }),
    }),

    getEmailSegments: build.query<{ segments: EmailSegment[] }, void>({
      query: () => "/api/admin/email/segments",
      providesTags: ["EmailSegment"],
    }),

    getEmailRecipients: build.query<{ recipients: EmailRecipient[] }, EmailSegmentId>({
      query: (segment) => `/api/admin/email/recipients?segment=${segment}`,
      providesTags: ["EmailSegment"],
    }),

    sendAdminEmail: build.mutation<
      EmailSendResult,
      {
        subject: string;
        body: string;
        segment?: EmailSegmentId;
        userIds?: string[];
        /** Hand-entered addresses, for people who have no account. Wins over `userIds`. */
        emails?: string[];
        cta?: { label: string; href: string };
        layout?: MailLayout;
      }
    >({
      query: (payload) => ({ url: "/api/admin/email/send", method: "POST", body: payload }),
    }),

    sendTestEmail: build.mutation<
      { ok: true; email: string },
      {
        subject: string;
        body: string;
        cta?: { label: string; href: string };
        layout?: MailLayout;
      }
    >({
      query: (payload) => ({ url: "/api/admin/email/test", method: "POST", body: payload }),
    }),

    /* ----------------------------- demo usage ----------------------------- */
    getDemoUsage: build.query<DemoUsage, void>({
      query: () => "/api/admin/demo/usage",
      providesTags: ["DemoUsage"],
    }),

    setDemoLimit: build.mutation<{ limit: number }, number>({
      query: (limit) => ({ url: "/api/admin/demo/limit", method: "PUT", body: { limit } }),
      invalidatesTags: ["DemoUsage"],
    }),

    /* -------------------------------- goals ------------------------------- */
    getGoals: build.query<Goal[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/goals`,
      providesTags: ["Goal"],
    }),

    createGoal: build.mutation<
      Goal,
      { workspaceId: string; name: string; kind: "page" | "event"; match: string }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/goals`,
        method: "POST",
        body,
      }),
      // A new goal changes the conversion numbers the stats endpoint reports.
      invalidatesTags: ["Goal", "Stats"],
    }),

    deleteGoal: build.mutation<void, { workspaceId: string; goalId: string }>({
      query: ({ workspaceId, goalId }) => ({
        url: `/api/workspaces/${workspaceId}/goals/${goalId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Goal", "Stats"],
    }),

    /* ------------------------------- api keys ----------------------------- */
    getApiKeys: build.query<ApiKey[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/keys`,
      providesTags: ["ApiKey"],
    }),

    createApiKey: build.mutation<ApiKey, { workspaceId: string; name: string }>({
      query: ({ workspaceId, name }) => ({
        url: `/api/workspaces/${workspaceId}/keys`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["ApiKey"],
    }),

    revokeApiKey: build.mutation<void, { workspaceId: string; keyId: string }>({
      query: ({ workspaceId, keyId }) => ({
        url: `/api/workspaces/${workspaceId}/keys/${keyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ApiKey"],
    }),

    /* --------------------------------- SEO -------------------------------- */

    /**
     * Run an audit. A mutation rather than a query because it is an expensive,
     * explicitly triggered action — the server reuses a recent report unless
     * `refresh` is set, so repeat clicks are cheap without RTK caching them.
     */
    analyzeSeo: build.mutation<
      { report: SeoReport; cached: boolean },
      { workspaceId: string; siteId: string; url?: string; refresh?: boolean }
    >({
      query: ({ workspaceId, siteId, url, refresh }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/analyze${
          refresh ? "?refresh=1" : ""
        }`,
        method: "POST",
        body: { url },
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: siteId }],
    }),

    getSeoReports: build.query<
      SeoReportSummary[],
      { workspaceId: string; siteId: string; limit?: number }
    >({
      query: ({ workspaceId, siteId, limit = 20 }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/reports?limit=${limit}`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: siteId }],
    }),

    getLatestSeoReport: build.query<
      SeoReport,
      { workspaceId: string; siteId: string; url?: string }
    >({
      query: ({ workspaceId, siteId, url }) => {
        const qs = url ? `?url=${encodeURIComponent(url)}` : "";
        return `/api/workspaces/${workspaceId}/sites/${siteId}/seo/latest${qs}`;
      },
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: siteId }],
    }),

    getSeoReport: build.query<
      SeoReport,
      { workspaceId: string; siteId: string; reportId: string }
    >({
      query: ({ workspaceId, siteId, reportId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/reports/${reportId}`,
      providesTags: (_r, _e, { reportId }) => [{ type: "Seo", id: reportId }],
    }),

    deleteSeoReport: build.mutation<
      void,
      { workspaceId: string; siteId: string; reportId: string }
    >({
      query: ({ workspaceId, siteId, reportId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/reports/${reportId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: siteId }],
    }),

    /* --------------------------- per-report sharing ---------------------- */
    getSeoShare: build.query<
      SeoShareState,
      { workspaceId: string; siteId: string; reportId: string }
    >({
      query: ({ workspaceId, siteId, reportId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/reports/${reportId}/share`,
      providesTags: (_r, _e, { reportId }) => [{ type: "Seo", id: `share-${reportId}` }],
    }),

    setSeoShare: build.mutation<
      SeoShareState,
      {
        workspaceId: string;
        siteId: string;
        reportId: string;
        enabled: boolean;
        rotate?: boolean;
        panels?: SeoSharePanels;
      }
    >({
      query: ({ workspaceId, siteId, reportId, enabled, rotate, panels }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/reports/${reportId}/share`,
        method: "PUT",
        body: { enabled, rotate, panels },
      }),
      invalidatesTags: (_r, _e, { reportId }) => [{ type: "Seo", id: `share-${reportId}` }],
    }),

    /** The public read-only view — unauthenticated, token is the whole credential. */
    getPublicSeoReport: build.query<PublicSeoReport, { token: string; count?: boolean }>({
      query: ({ token, count }) =>
        `/api/public/seo/${token}${count ? "?count=1" : ""}`,
    }),

    getSearchTraffic: build.query<
      SeoSearchTraffic,
      { workspaceId: string; siteId: string; days?: number }
    >({
      query: ({ workspaceId, siteId, days = 30 }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/search-traffic?days=${days}`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `search-${siteId}` }],
    }),

    getFieldVitals: build.query<
      SeoFieldVitals,
      { workspaceId: string; siteId: string; days?: number }
    >({
      query: ({ workspaceId, siteId, days = 30 }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/vitals?days=${days}`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `vitals-${siteId}` }],
    }),

    runCrawl: build.mutation<SeoCrawlReport, { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/crawl`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `crawl-${siteId}` }],
    }),

    getLatestCrawl: build.query<SeoCrawlReport, { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/crawl/latest`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `crawl-${siteId}` }],
    }),

    /* ----------------------------- competitors ---------------------------- */

    getCompetitors: build.query<SeoCompetitor[], { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    addCompetitor: build.mutation<
      SeoCompetitor,
      { workspaceId: string; siteId: string; url: string; label?: string }
    >({
      query: ({ workspaceId, siteId, url, label }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors`,
        method: "POST",
        body: { url, label },
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    refreshCompetitor: build.mutation<
      SeoCompetitor,
      { workspaceId: string; siteId: string; competitorId: string }
    >({
      query: ({ workspaceId, siteId, competitorId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors/${competitorId}/refresh`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    deleteCompetitor: build.mutation<
      void,
      { workspaceId: string; siteId: string; competitorId: string }
    >({
      query: ({ workspaceId, siteId, competitorId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors/${competitorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    /* -------------------------------- billing ------------------------------ */

    getPlans: build.query<Plan[], { currency: Currency }>({
      query: ({ currency }) => `/api/billing/plans?currency=${currency}`,
      providesTags: ["Plan"],
    }),

    getAddonPacks: build.query<AddonPack[], { currency: Currency }>({
      query: ({ currency }) => `/api/billing/addons?currency=${currency}`,
      providesTags: ["AddonPack"],
    }),

    startSubscription: build.mutation<
      StartSubscriptionResponse,
      {
        planSlug: string;
        cycle: BillingCycle;
        couponCode?: string;
        currency: Currency;
        /** Packs to buy in the same checkout. Priced server-side from the catalogue. */
        addons?: { slug: string; packs: number }[];
      }
    >({
      query: (body) => ({ url: "/api/billing/subscribe", method: "POST", body }),
    }),

    verifySubscription: build.mutation<
      { ok: true },
      { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
    >({
      query: (body) => ({ url: "/api/billing/subscribe/verify", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),

    startAddonPurchase: build.mutation<
      StartAddonPurchaseResponse,
      { slug: string; couponCode?: string; currency: Currency; packs?: number }
    >({
      query: ({ slug, couponCode, currency, packs }) => ({
        url: `/api/billing/addons/${slug}/purchase`,
        method: "POST",
        body: { couponCode, currency, packs },
      }),
    }),

    verifyAddonPurchase: build.mutation<
      { ok: true },
      { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
    >({
      query: (body) => ({ url: "/api/billing/addons/verify", method: "POST", body }),
      invalidatesTags: ["Billing"],
    }),

    /**
     * Paid receipts, newest first. Plans and addon packs arrive as one merged
     * history — the server interleaves them, since that's how someone reading
     * their own billing thinks about it.
     *
     * Tagged "Billing" so completing a purchase pulls the new receipt in
     * without a manual refresh.
     */
    getInvoices: build.query<Invoice[], void>({
      query: () => "/api/billing/invoices",
      providesTags: ["Billing"],
    }),

    /** Preview a coupon's discount against a known amount before checkout starts. */
    checkCoupon: build.mutation<CouponCheckResult, { amount: number; code: string }>({
      query: (body) => ({ url: "/api/billing/coupons/check", method: "POST", body }),
    }),

    /* -------------------------- scheduled reports --------------------------- */

    getReportSchedules: build.query<{ schedules: ReportSchedule[]; mailConfigured: boolean }, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/reports`,
      providesTags: ["ReportSchedule"],
    }),

    saveReportSchedule: build.mutation<
      ReportSchedule,
      { workspaceId: string; id?: string } & ReportScheduleInput
    >({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/reports${id ? `/${id}` : ""}`,
        method: id ? "PUT" : "POST",
        body,
      }),
      invalidatesTags: ["ReportSchedule"],
    }),

    deleteReportSchedule: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReportSchedule"],
    }),

    /** Send this report now, to the owner only — a preview, not a way to mail the whole list. */
    testReportSchedule: build.mutation<{ ok: true; sentTo: string[] }, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/reports/${id}/test`,
        method: "POST",
      }),
    }),

    /** Live state of the paired WhatsApp session — checked per page load, never cached long. */
    getWhatsAppStatus: build.query<WhatsAppStatus, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/reports/whatsapp/status`,
      // A dropped pairing should surface on the next visit, not 5 minutes later.
      keepUnusedDataFor: 30,
    }),

    /** Send this report over WhatsApp now, to one number already on it. */
    testReportWhatsApp: build.mutation<
      { ok: true; sentTo: string; messageId: string },
      { workspaceId: string; id: string; phone: string }
    >({
      query: ({ workspaceId, id, phone }) => ({
        url: `/api/workspaces/${workspaceId}/reports/${id}/test-whatsapp`,
        method: "POST",
        body: { phone },
      }),
    }),

    /* ---------------------------- admin billing ----------------------------- */

    getAdminPlans: build.query<Plan[], void>({
      query: () => "/api/admin/billing/plans",
      providesTags: ["Plan"],
    }),

    /** Price is the only editable field — plans themselves are fixed in backend code. */
    saveAdminPlanPrice: build.mutation<Plan, { slug: string; priceMonthly: CurrencyPrices; priceYearly: CurrencyPrices }>({
      query: ({ slug, ...body }) => ({
        url: `/api/admin/billing/plans/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Plan"],
    }),

    /** The rate the USD column was last derived from — cached, never fetched live. */
    getAdminFx: build.query<FxStatus, void>({
      query: () => "/api/admin/billing/fx",
      providesTags: ["Fx"],
    }),

    /** Refetch the live rate and recompute every plan's non-INR price from its INR price. */
    syncAdminPlanCurrency: build.mutation<{ snapshot: FxSnapshot; base: Currency; derived: Currency[] }, void>({
      query: () => ({ url: "/api/admin/billing/plans/sync-currency", method: "POST" }),
      invalidatesTags: ["Plan", "Fx"],
    }),

    getAdminAddonPacks: build.query<AddonPack[], void>({
      query: () => "/api/admin/billing/addons",
      providesTags: ["AddonPack"],
    }),

    saveAdminAddonPack: build.mutation<AddonPack, Partial<AddonPack> & { _id?: string }>({
      query: ({ _id, ...body }) => ({
        url: _id ? `/api/admin/billing/addons/${_id}` : "/api/admin/billing/addons",
        method: _id ? "PUT" : "POST",
        body,
      }),
      invalidatesTags: ["AddonPack"],
    }),

    deleteAdminAddonPack: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/billing/addons/${id}`, method: "DELETE" }),
      invalidatesTags: ["AddonPack"],
    }),

    /* ---------------------------- admin coupons ----------------------------- */

    getAdminCoupons: build.query<Coupon[], void>({
      query: () => "/api/admin/billing/coupons",
      providesTags: ["Coupon"],
    }),

    saveAdminCoupon: build.mutation<Coupon, Partial<Coupon> & { _id?: string }>({
      query: ({ _id, ...body }) => ({
        url: _id ? `/api/admin/billing/coupons/${_id}` : "/api/admin/billing/coupons",
        method: _id ? "PUT" : "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    deleteAdminCoupon: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/billing/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useRenameWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetShareQuery,
  useSetShareMutation,
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteOptionsMutation,
  useDeleteSiteMutation,
  useGetStatsQuery,
  useComputeFunnelMutation,
  useGetRetentionQuery,
  useGetInstallStatusQuery,
  useLazyGetInstallStatusQuery,
  useGetLayoutQuery,
  useSaveLayoutMutation,
  useGetAdminUsersQuery,
  useDeleteAdminUserMutation,
  useSetAdminUserRoleMutation,
  useGetAdminUserBillingQuery,
  useGetContactMessagesQuery,
  useGetContactUnreadQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
  useReplyToContactMessageMutation,
  useSendSupportMessageMutation,
  useGetEmailStatusQuery,
  useGetEmailSegmentsQuery,
  useGetEmailTemplatesQuery,
  usePreviewEmailMutation,
  useGetEmailRecipientsQuery,
  useSendAdminEmailMutation,
  useSendTestEmailMutation,
  useGetGoalsQuery,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useAnalyzeSeoMutation,
  useGetSeoReportsQuery,
  useGetLatestSeoReportQuery,
  useGetSeoReportQuery,
  useDeleteSeoReportMutation,
  useGetSeoShareQuery,
  useSetSeoShareMutation,
  useGetPublicSeoReportQuery,
  useGetDemoUsageQuery,
  useSetDemoLimitMutation,
  useGetCompetitorsQuery,
  useAddCompetitorMutation,
  useRefreshCompetitorMutation,
  useDeleteCompetitorMutation,
  useGetSearchTrafficQuery,
  useGetFieldVitalsQuery,
  useRunCrawlMutation,
  useGetLatestCrawlQuery,
  useGetPlansQuery,
  useGetAddonPacksQuery,
  useStartSubscriptionMutation,
  useVerifySubscriptionMutation,
  useStartAddonPurchaseMutation,
  useVerifyAddonPurchaseMutation,
  useGetAdminPlansQuery,
  useSaveAdminPlanPriceMutation,
  useGetReportSchedulesQuery,
  useSaveReportScheduleMutation,
  useDeleteReportScheduleMutation,
  useTestReportScheduleMutation,
  useGetWhatsAppStatusQuery,
  useTestReportWhatsAppMutation,
  useGetAdminFxQuery,
  useSyncAdminPlanCurrencyMutation,
  useGetAdminAddonPacksQuery,
  useSaveAdminAddonPackMutation,
  useDeleteAdminAddonPackMutation,
  useCheckCouponMutation,
  useGetInvoicesQuery,
  useGetAdminCouponsQuery,
  useSaveAdminCouponMutation,
  useDeleteAdminCouponMutation,
} = api;
