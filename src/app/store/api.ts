import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getToken, isDemoToken } from "@/shared/lib/http";
import { notify, errMessage } from "@/shared/lib/notify";
import { resolveDemoRequest } from "@/features/demo/demoResolver";
import type {
  AdminUserPage, AdminUserBilling, ApiKey, Site, Stats, Workspace,
  ContactMessage, ContactMessagePage, ContactStatus,
  FunnelStepInput, FunnelResultStep, SavedFunnel, RetentionCohort, Goal, FlowNode, FlowEdge,
  EmailStatus, EmailSegment, EmailSegmentId, EmailRecipient, EmailSendResult, MailTemplate,
  MailLayout,
} from "@/shared/types";
import type { Placed } from "@/features/analytics/hooks/useHomeWidgets";
import type { TrackerOptions } from "@/features/workspace/tracker";
import type {
  ShareState, SharePanels, SeoReport, SeoReportSummary, SeoCompetitor,
  SeoCompetitorAnalysis, SeoCompetitorHistoryPoint,
  SeoSearchTraffic, SeoFieldVitals, SeoCrawlReport,
  SeoShareState, SeoSharePanels, PublicSeoReport,
  DemoUsage, LinkedInStatus, InstagramStatus, ScheduledPost, ScheduledPostsResponse, SentPostsResponse,
  PostFrequency, PostMode, PostProvider,
  Plan, OrbitPlan, AddonPack, BillingCycle, Currency, CurrencyPrices, FxStatus, FxSnapshot,
  ReportSchedule, ReportScheduleInput, WhatsAppStatus,
  StartSubscriptionResponse, StartAddonPurchaseResponse,
  Coupon, CouponCheckResult, Invoice, QuotaSummary,
  MembersResponse, WorkspaceInvite, WorkspaceRole, InvitePreview,
  Segment, Marker, MarkerKind, StatsFilter,
  CompareMode, BreakdownComparisonRow,
  JourneyUser, JourneyEvent,
} from "@/shared/types";

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
  tagTypes: ["Workspace", "Site", "Stats", "ApiKey", "InstallStatus", "Layout", "Theme", "AdminUser", "AdminUserBilling", "Goal", "Funnel", "Share", "Seo", "Competitor", "DemoUsage", "EmailSegment", "Plan", "AddonPack", "Billing", "Coupon", "Fx", "ReportSchedule", "ContactMessage", "Segment", "Marker", "Members", "Usage", "LinkedIn", "Instagram", "ScheduledPost", "SentPost"],
  // Hold a cached entry for 5 minutes after the last component stops using it.
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    /**
     * One workspace's plan and usage, without refetching the workspace list.
     *
     * Usage moves on every audit, crawl and Orbit question; the list around it
     * does not. Anything that spends quota invalidates `Usage`, so the counters
     * refresh themselves rather than going stale until the next full reload.
     */
    getWorkspaceUsage: build.query<QuotaSummary, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/usage`,
      providesTags: ["Usage"],
    }),

    getWorkspaces: build.query<Workspace[], void>({
      query: () => "/api/workspaces",
      // Also tagged "Billing": each workspace carries the plan it is on, so a
      // purchase has to refetch this list to show what was bought.
      providesTags: (result) => [
        "Workspace",
        "Billing",
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

    // A written share caption. A mutation rather than a query: it spends Orbit
    // quota, so it must only run when the user asks for it — never re-fetched
    // on remount or refocus.
    writeShareCaption: build.mutation<
      { caption: string },
      /**
       * `topic` writes about whatever the author names instead of about their
       * public dashboard — the scheduled-post composer sends it, the share
       * panel does not.
       */
      { workspaceId: string; platform: string; topic?: string }
    >({
      query: ({ workspaceId, platform, topic }) => ({
        url: `/api/workspaces/${workspaceId}/share/caption`,
        method: "POST",
        body: { platform, ...(topic ? { topic } : {}) },
      }),
    }),

    /**
     * One turn of a scheduling conversation: Orbit asks what it still needs,
     * and returns the whole plan each time so the composer's fields track the
     * conversation as it happens.
     *
     * `now` is the author's own wall clock, sent because "tomorrow" means their
     * tomorrow. A mutation for the same reason `writeShareCaption` is one: it
     * spends Orbit quota and must run only when asked.
     */
    planScheduledPost: build.mutation<
      {
        /** What Orbit says back — a question, or its summary of the finished post. */
        message: string;
        /** Orbit has everything and is showing the post for confirmation. */
        done: boolean;
        /** Orbit is waiting on an image before it can finish. */
        needsImage: boolean;
        caption: string;
        name: string;
        mode: "once" | "repeat";
        date: string;
        time: string;
        frequency: "daily" | "weekly" | "monthly";
        hour: number;
        minute: number;
        weekday: number;
        dayOfMonth: number;
      },
      {
        workspaceId: string;
        platform: string;
        message: string;
        /** The conversation so far, oldest first, excluding `message`. */
        turns: { role: "user" | "assistant"; content: string }[];
        /** The composer's fields as they stand, so Orbit builds on them. */
        draft: Record<string, unknown>;
        now: string;
        /** The model picked in the chat panel, when there is one. */
        modelId?: string;
      }
    >({
      query: ({ workspaceId, platform, message, turns, draft, now, modelId }) => ({
        url: `/api/workspaces/${workspaceId}/share/plan`,
        method: "POST",
        body: { platform, message, turns, draft, now, ...(modelId ? { modelId } : {}) },
      }),
    }),

    /**
     * Whether this account has LinkedIn connected, and as whom.
     *
     * Never carries the access token — the server projects a small profile
     * subset by hand, and the token column is excluded at the model level.
     */
    getLinkedInStatus: build.query<LinkedInStatus, void>({
      query: () => "/api/auth/linkedin/status",
      providesTags: ["LinkedIn"],
    }),

    /**
     * Drop the stored connection. Invalidating the tag is what flips the Share
     * Panel back to "Connect LinkedIn" without a reload.
     */
    disconnectLinkedIn: build.mutation<{ connected: false }, void>({
      query: () => ({ url: "/api/auth/linkedin", method: "DELETE" }),
      invalidatesTags: ["LinkedIn"],
    }),

    /**
     * Whether this account has Instagram connected, and as whom.
     *
     * Same contract as the LinkedIn status above: the access token is excluded
     * at the model level and never reaches this response.
     */
    getInstagramStatus: build.query<InstagramStatus, void>({
      query: () => "/api/auth/instagram/status",
      providesTags: ["Instagram"],
    }),

    /**
     * Drop the stored connection.
     *
     * Also invalidates `ScheduledPost`: the server pauses any Instagram schedule
     * on disconnect, and the list must show that rather than rows still claiming
     * to be active.
     */
    disconnectInstagram: build.mutation<{ connected: false }, void>({
      query: () => ({ url: "/api/auth/instagram", method: "DELETE" }),
      invalidatesTags: ["Instagram", "ScheduledPost"],
    }),

    /**
     * Publish the composed post to the user's own LinkedIn feed.
     *
     * The image travels as the same PNG data URL the panel already renders and
     * previews: the card is drawn on a canvas in the browser and never uploaded
     * anywhere, so there is no URL to send instead — and LinkedIn wants the
     * bytes either way. The access token stays on the server; nothing about it
     * is sent from here.
     *
     * Invalidates `LinkedIn` because a rejected token makes the server mark the
     * connection expired, and the panel should pick that up.
     */
    postToLinkedIn: build.mutation<
      { posted: true; postUrl: string | null },
      { caption: string; image: string }
    >({
      query: (body) => ({ url: "/api/auth/linkedin/post", method: "POST", body }),
      // `SentPost` too: a share is a publish like any other and is recorded as
      // one, so the Sent tab gains a row the moment this succeeds.
      invalidatesTags: ["LinkedIn", "SentPost"],
    }),

    /**
     * Scheduled LinkedIn posts belonging to the signed-in user.
     *
     * Not workspace-scoped in the URL: a schedule publishes with the user's own
     * LinkedIn token, so the whole set is theirs regardless of which workspace
     * each post is about.
     */
    getScheduledPosts: build.query<ScheduledPostsResponse, void>({
      query: () => "/api/social/posts",
      providesTags: ["ScheduledPost"],
    }),

    /**
     * Posts that have actually been published, newest first.
     *
     * A separate collection from the schedules above, not a filter over them:
     * a repeating schedule is one row that has published many times, and the
     * Sent tab is a list of those publishes. See `SentPost`.
     *
     * Pages are merged into a single cache entry so "load more" appends rather
     * than replacing the list — `serializeQueryArgs` drops the cursor from the
     * cache key, and `merge` concatenates. Without that, every page would
     * evict the one before it and the list would flicker back to twenty rows.
     */
    getSentPosts: build.query<
      SentPostsResponse,
      { cursor?: string; status?: "failed" } | void
    >({
      query: (args) => {
        const cursor = args && "cursor" in args ? args.cursor : undefined;
        const status = args && "status" in args ? args.status : undefined;
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (status) params.set("status", status);
        const qs = params.toString();
        return qs ? `/api/social/posts/sent?${qs}` : "/api/social/posts/sent";
      },
      // Keyed by the subset being read, not by the page within it: pages merge
      // into one list, but "everything published" and "only what failed" are
      // two lists and must not merge into each other.
      serializeQueryArgs: ({ queryArgs }) => {
        const status = queryArgs && "status" in queryArgs ? queryArgs.status : undefined;
        return status ? `sent:${status}` : "sent";
      },
      merge: (existing, incoming, { arg }) => {
        // A fetch with no cursor is a refresh of the first page, not a
        // continuation — it replaces the list. Appending it instead would
        // duplicate every row each time a publish invalidated the cache.
        const cursor = arg && "cursor" in arg ? arg.cursor : undefined;
        if (!cursor) return incoming;

        // Deduplicated on id because the cursor is a timestamp: two posts
        // published in the same millisecond would otherwise straddle the page
        // boundary and appear twice.
        const seen = new Set(existing.posts.map((p) => p.id));
        return {
          ...incoming,
          posts: [...existing.posts, ...incoming.posts.filter((p) => !seen.has(p.id))],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
      providesTags: ["SentPost"],
    }),

    /**
     * Remove one row from the Sent history.
     *
     * The record only — the post stays live on the network. Invalidating
     * `SentPost` refetches the first page rather than splicing the row out
     * locally: the list is paginated and merged, so a local removal would leave
     * the page boundaries wrong until the next fetch anyway.
     */
    deleteSentPost: build.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/api/social/posts/runs/${id}`, method: "DELETE" }),
      invalidatesTags: ["SentPost"],
    }),

    /**
     * Create a schedule. `image` is a base64 data URL, uploaded to Cloudinary
     * server-side — the same path avatars take.
     */
    createScheduledPost: build.mutation<
      ScheduledPost,
      {
        workspaceId: string; name: string; caption: string; image?: string; images?: string[];
        format?: "feed" | "story";
        /**
         * Which network to publish to. Optional, defaulting to LinkedIn on the
         * server, so a caller that predates Instagram keeps working.
         */
        provider?: PostProvider;
        mode: PostMode;
        /** ISO instant. Required for a one-off, ignored for a repeat. */
        runAt?: string;
        frequency?: PostFrequency; hour?: number; minute?: number;
        timezone: string; weekday?: number; dayOfMonth?: number;
      }
    >({
      query: (body) => ({ url: "/api/social/posts", method: "POST", body }),
      // `Usage` too: creating, deleting or publishing a post changes how many
      // slots are left, and a stale counter would let someone start writing a
      // post the server is about to refuse.
      invalidatesTags: ["ScheduledPost", "Usage"],
    }),

    /** Edit a schedule, including pausing and resuming it. */
    updateScheduledPost: build.mutation<
      ScheduledPost,
      { id: string } & Partial<{
        name: string; caption: string; image: string; images: string[]; status: "active" | "paused";
        mode: PostMode; runAt: string;
        frequency: PostFrequency; hour: number; minute: number;
        timezone: string; weekday: number; dayOfMonth: number;
      }>
    >({
      query: ({ id, ...body }) => ({ url: `/api/social/posts/${id}`, method: "PATCH", body }),
      // `Usage` too: creating, deleting or publishing a post changes how many
      // slots are left, and a stale counter would let someone start writing a
      // post the server is about to refuse.
      invalidatesTags: ["ScheduledPost", "Usage"],
    }),

    deleteScheduledPost: build.mutation<{ deleted: true }, string>({
      query: (id) => ({ url: `/api/social/posts/${id}`, method: "DELETE" }),
      // `Usage` too: creating, deleting or publishing a post changes how many
      // slots are left, and a stale counter would let someone start writing a
      // post the server is about to refuse.
      invalidatesTags: ["ScheduledPost", "Usage"],
    }),

    /**
     * Publish a schedule now, without disturbing its cadence.
     *
     * Returns the updated schedule plus the permalink, so the row can show its
     * new outcome without a refetch — though the tag is invalidated anyway,
     * since `lastRunAt` and the error line are read from the list.
     */
    publishScheduledPost: build.mutation<ScheduledPost & { postUrl: string | null }, string>({
      query: (id) => ({ url: `/api/social/posts/${id}/publish`, method: "POST" }),
      // `Usage` too: creating, deleting or publishing a post changes how many
      // slots are left, and a stale counter would let someone start writing a
      // post the server is about to refuse.
      // `SentPost` because publishing is exactly what adds a row to the Sent
      // tab — without this it would still be showing the previous publish.
      invalidatesTags: ["ScheduledPost", "Usage", "SentPost"],
    }),

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
        platform?: "web" | "app";
        domain?: string;
        framework?: string;
        bundleId?: string;
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

    getStats: build.query<
      Stats,
      {
        workspaceId: string;
        range: string;
        filter?: string;
        sites?: string[];
        from?: string;
        to?: string;
        compare?: CompareMode;
        compareFrom?: string;
        compareTo?: string;
      }
    >({
      query: ({ workspaceId, range, filter, sites, from, to, compare, compareFrom, compareTo }) => {
        const qs = new URLSearchParams({ range });
        if (filter) qs.set("filter", filter);
        // Empty selection means "all sites" — the server defaults to that when
        // the param is absent, so only send it when a subset is chosen.
        if (sites && sites.length) qs.set("sites", sites.join(","));
        if (range === "custom" && from && to) {
          qs.set("from", from);
          qs.set("to", to);
        }
        // "previous" is the server's default; sending it would only make the
        // cache key noisier for the same response.
        if (compare && compare !== "previous") qs.set("compare", compare);
        if (compare === "custom" && compareFrom) {
          qs.set("compareFrom", compareFrom);
          if (compareTo) qs.set("compareTo", compareTo);
        }
        return `/api/workspaces/${workspaceId}/stats?${qs.toString()}`;
      },
      providesTags: (_r, _e, a) => [
        {
          type: "Stats",
          id: `${a.workspaceId}-${a.range}-${a.filter ?? ""}-${(a.sites ?? []).join(",")}-${a.from ?? ""}-${a.to ?? ""}-${a.compare ?? ""}-${a.compareFrom ?? ""}-${a.compareTo ?? ""}`,
        },
      ],
    }),

    getStatsCompare: build.query<
      { dimension: string; compare: CompareMode; rows: BreakdownComparisonRow[] },
      {
        workspaceId: string;
        dimension: string;
        range: string;
        filter?: string;
        sites?: string[];
        from?: string;
        to?: string;
        compare?: CompareMode;
        compareFrom?: string;
        compareTo?: string;
      }
    >({
      query: ({ workspaceId, dimension, range, filter, sites, from, to, compare, compareFrom, compareTo }) => {
        const qs = new URLSearchParams({ range, dimension });
        if (filter) qs.set("filter", filter);
        if (sites && sites.length) qs.set("sites", sites.join(","));
        if (range === "custom" && from && to) {
          qs.set("from", from);
          qs.set("to", to);
        }
        if (compare && compare !== "previous") qs.set("compare", compare);
        if (compare === "custom" && compareFrom) {
          qs.set("compareFrom", compareFrom);
          if (compareTo) qs.set("compareTo", compareTo);
        }
        return `/api/workspaces/${workspaceId}/stats/compare?${qs.toString()}`;
      },
      providesTags: (_r, _e, a) => [
        {
          type: "Stats",
          id: `compare-${a.workspaceId}-${a.dimension}-${a.range}-${a.filter ?? ""}-${(a.sites ?? []).join(",")}-${a.from ?? ""}-${a.to ?? ""}-${a.compare ?? ""}`,
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

    getFunnels: build.query<SavedFunnel[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/funnels`,
      providesTags: ["Funnel"],
    }),

    createFunnel: build.mutation<
      SavedFunnel,
      { workspaceId: string; name: string; steps: FunnelStepInput[] }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/funnels`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Funnel"],
    }),

    updateFunnel: build.mutation<
      SavedFunnel,
      { workspaceId: string; funnelId: string; name: string; steps: FunnelStepInput[] }
    >({
      query: ({ workspaceId, funnelId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/funnels/${funnelId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Funnel"],
    }),

    deleteFunnel: build.mutation<void, { workspaceId: string; funnelId: string }>({
      query: ({ workspaceId, funnelId }) => ({
        url: `/api/workspaces/${workspaceId}/funnels/${funnelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Funnel"],
    }),

    getUserFlow: build.query<
      { nodes: FlowNode[]; edges: FlowEdge[] },
      { workspaceId: string; range: string; sites?: string[]; from?: string; to?: string }
    >({
      query: ({ workspaceId, range, sites, from, to }) => {
        const qs = new URLSearchParams({ range });
        if (sites && sites.length) qs.set("sites", sites.join(","));
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        return `/api/workspaces/${workspaceId}/user-flow?${qs.toString()}`;
      },
      providesTags: (_r, _e, { workspaceId, range, sites }) => [
        { type: "Stats", id: `user-flow-${workspaceId}-${range}-${(sites ?? []).join(",")}` },
      ],
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

    // `theme: null` means this workspace has never saved an Appearance
    // choice — the client falls back to localStorage, then its own built-in
    // defaults. Shape is untyped (Record<string, unknown>) on purpose: the
    // FE's ThemePrefs is the source of truth for what the keys mean, and the
    // server stores whatever object it's given without validating fields.
    getWorkspaceTheme: build.query<{ theme: Record<string, unknown> | null }, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/theme`,
      providesTags: (_r, _e, workspaceId) => [{ type: "Theme", id: workspaceId }],
    }),

    saveWorkspaceTheme: build.mutation<
      { theme: Record<string, unknown> },
      { workspaceId: string; theme: Record<string, unknown> }
    >({
      query: ({ workspaceId, theme }) => ({
        url: `/api/workspaces/${workspaceId}/theme`,
        method: "PUT",
        body: theme,
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Theme", id: workspaceId },
      ],
    }),

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

    getAdminUserBilling: build.query<AdminUserBilling, string>({
      query: (userId) => `/api/admin/users/${userId}/billing`,
      providesTags: ["AdminUserBilling"],
    }),

    /** Grant one extra site slot to a workspace. Superadmin-only, support-only
     *  exception — not a customer purchase. */
    grantAdminSiteSlot: build.mutation<{ workspaceId: string; addonSiteSlots: number }, string>({
      query: (workspaceId) => ({ url: `/api/admin/workspaces/${workspaceId}/site-slots`, method: "POST" }),
      invalidatesTags: ["AdminUserBilling"],
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


    /**
     * Whether Orbit can run, which models may answer, and the workspace's tier.
     *
     * The list is already filtered server-side to providers that have a key, so
     * the picker never offers something that would fail. Models above the
     * workspace's Orbit plan come back `locked` rather than missing — the picker
     * shows them greyed, because a hidden upgrade sells nothing.
     */
    getOrbitStatus: build.query<
      {
        configured: boolean;
        plan: {
          slug: string;
          name: string;
          tier: "basic" | "standard" | "advanced";
          monthlyQuota: number;
          maxQuestionChars: number;
        };
        models: {
          id: string;
          label: string;
          hint: string;
          /** True when the workspace's Orbit plan cannot reach this model. */
          locked: boolean;
          /** The tier that unlocks it, for the upgrade hint. */
          tier: "basic" | "standard" | "advanced";
        }[];
      },
      string
    >({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/orbit/status`,
    }),

    /**
     * Ask Orbit a question.
     *
     * The transcript is sent with every question because the server keeps none
     * — the conversation lives in the browser, so there is nothing stored to
     * retain or hand over.
     */
    askOrbit: build.mutation<
      {
        reply: string;
        /** What to ask next. Empty when nothing follows. */
        suggestions: string[];
        /**
         * Which model actually answered.
         *
         * Not always the one requested: the server falls through to another
         * when a model is rate-limited, and the UI says so rather than letting
         * a picked model silently not be the one used.
         */
        model: string;
        modelLabel: string;
        /**
         * Questions left this cycle, plan remainder plus purchased credits.
         *
         * Returned with the answer so the panel can count down without a second
         * round trip. Null when the workspace has no subscription row to read.
         */
        remaining: number | null;
      },
      {
        workspaceId: string;
        question: string;
        history: { role: "user" | "assistant"; content: string }[];
        /** Preferred model. The server treats an unknown id as "no preference". */
        model?: string;
      }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/orbit/ask`,
        method: "POST",
        body,
      }),
      // An answered question spends quota, so anything showing a remaining
      // count is now wrong. Invalidating here is what keeps the Billing meters
      // honest without the chat panel knowing they exist.
      invalidatesTags: ["Usage"],
    }),

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

    getDemoUsage: build.query<DemoUsage, void>({
      query: () => "/api/admin/demo/usage",
      providesTags: ["DemoUsage"],
    }),

    setDemoLimit: build.mutation<{ limit: number }, number>({
      query: (limit) => ({ url: "/api/admin/demo/limit", method: "PUT", body: { limit } }),
      invalidatesTags: ["DemoUsage"],
    }),

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
      // "Usage" because a fresh audit spends a credit — a cached one does not,
      // but invalidating either way costs one cheap request and avoids the
      // counter being right only sometimes.
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: siteId }, "Usage"],
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
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `crawl-${siteId}` }, "Usage"],
    }),

    getLatestCrawl: build.query<SeoCrawlReport, { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/crawl/latest`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Seo", id: `crawl-${siteId}` }],
    }),


    getCompetitors: build.query<SeoCompetitor[], { workspaceId: string; siteId: string }>({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    /**
     * Your latest audit against every competitor, with the gaps worked out.
     *
     * 404s until the site has an audit of its own — there is no baseline to
     * compare against before then, and the page says so rather than retrying.
     */
    getCompetitorAnalysis: build.query<
      SeoCompetitorAnalysis,
      { workspaceId: string; siteId: string }
    >({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors/analysis`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Competitor", id: siteId }],
    }),

    getCompetitorHistory: build.query<
      SeoCompetitorHistoryPoint[],
      { workspaceId: string; siteId: string }
    >({
      query: ({ workspaceId, siteId }) =>
        `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors/history`,
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

    /** Re-fetch every competitor on the site in one call. */
    refreshAllCompetitors: build.mutation<
      { competitors: SeoCompetitor[]; refreshed: number; failed: number },
      { workspaceId: string; siteId: string }
    >({
      query: ({ workspaceId, siteId }) => ({
        url: `/api/workspaces/${workspaceId}/sites/${siteId}/seo/competitors/refresh-all`,
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


    getSegments: build.query<Segment[], string>({
      query: (wid) => `/api/workspaces/${wid}/segments`,
      providesTags: ["Segment"],
    }),

    saveSegment: build.mutation<
      Segment,
      { wid: string; name: string; filter: StatsFilter; pinned?: boolean }
    >({
      query: ({ wid, ...body }) => ({
        url: `/api/workspaces/${wid}/segments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Segment"],
    }),

    updateSegment: build.mutation<
      Segment,
      { wid: string; id: string; name?: string; filter?: StatsFilter; pinned?: boolean }
    >({
      query: ({ wid, id, ...body }) => ({
        url: `/api/workspaces/${wid}/segments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Segment"],
    }),

    deleteSegment: build.mutation<{ ok: true }, { wid: string; id: string }>({
      query: ({ wid, id }) => ({
        url: `/api/workspaces/${wid}/segments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Segment"],
    }),


    /**
     * Markers inside the visible window. Scoped by range so a workspace with
     * years of deploys doesn't ship them all to draw a 24h chart.
     */
    /** Recently active identified users — the entry point into their journey. */
    getJourneyUsers: build.query<{ users: JourneyUser[] }, { wid: string; q?: string; sites?: string[] }>({
      query: ({ wid, q, sites }) => {
        const qs = new URLSearchParams();
        if (q) qs.set("q", q);
        if (sites?.length) qs.set("sites", sites.join(","));
        const suffix = qs.toString() ? `?${qs}` : "";
        return `/api/workspaces/${wid}/users${suffix}`;
      },
    }),

    /** One user's full journey, oldest first. */
    getJourneyTimeline: build.query<
      { appUserId: string; events: JourneyEvent[] },
      { wid: string; appUserId: string; sites?: string[] }
    >({
      query: ({ wid, appUserId, sites }) => {
        const qs = new URLSearchParams();
        if (sites?.length) qs.set("sites", sites.join(","));
        const suffix = qs.toString() ? `?${qs}` : "";
        return `/api/workspaces/${wid}/track/${appUserId}${suffix}`;
      },
    }),

    getMarkers: build.query<Marker[], { wid: string; from?: string; to?: string }>({
      query: ({ wid, from, to }) => {
        const qs = new URLSearchParams();
        if (from) qs.set("from", from);
        if (to) qs.set("to", to);
        const suffix = qs.toString() ? `?${qs}` : "";
        return `/api/workspaces/${wid}/markers${suffix}`;
      },
      providesTags: ["Marker"],
    }),

    saveMarker: build.mutation<
      Marker,
      {
        wid: string;
        label: string;
        description?: string;
        kind?: MarkerKind;
        at?: string;
        siteIds?: string[];
      }
    >({
      query: ({ wid, ...body }) => ({
        url: `/api/workspaces/${wid}/markers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Marker"],
    }),

    updateMarker: build.mutation<
      Marker,
      {
        wid: string;
        id: string;
        label?: string;
        description?: string;
        kind?: MarkerKind;
        at?: string;
        siteIds?: string[];
      }
    >({
      query: ({ wid, id, ...body }) => ({
        url: `/api/workspaces/${wid}/markers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Marker"],
    }),

    deleteMarker: build.mutation<{ ok: true }, { wid: string; id: string }>({
      query: ({ wid, id }) => ({
        url: `/api/workspaces/${wid}/markers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Marker"],
    }),

    /** Everyone in a workspace, the pending invitations, and the caller's own role. */
    getMembers: build.query<MembersResponse, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/members`,
      providesTags: (_r, _e, workspaceId) => [{ type: "Members", id: workspaceId }],
    }),

    inviteMember: build.mutation<
      WorkspaceInvite,
      { workspaceId: string; email: string; role: WorkspaceRole }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/members/invites`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [{ type: "Members", id: workspaceId }],
    }),

    revokeInvite: build.mutation<void, { workspaceId: string; inviteId: string }>({
      query: ({ workspaceId, inviteId }) => ({
        url: `/api/workspaces/${workspaceId}/members/invites/${inviteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [{ type: "Members", id: workspaceId }],
    }),

    updateMemberRole: build.mutation<
      { id: string; role: WorkspaceRole },
      { workspaceId: string; memberId: string; role: WorkspaceRole }
    >({
      query: ({ workspaceId, memberId, role }) => ({
        url: `/api/workspaces/${workspaceId}/members/${memberId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_r, _e, { workspaceId }) => [{ type: "Members", id: workspaceId }],
    }),

    /** Remove someone, or leave the workspace yourself. */
    removeMember: build.mutation<void, { workspaceId: string; memberId: string }>({
      query: ({ workspaceId, memberId }) => ({
        url: `/api/workspaces/${workspaceId}/members/${memberId}`,
        method: "DELETE",
      }),
      // Also "Workspace": leaving removes it from your own list entirely.
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "Members", id: workspaceId },
        "Workspace",
      ],
    }),


    /** What an invite link is for. Readable before the recipient signs in. */
    getInvite: build.query<InvitePreview, string>({
      query: (token) => `/api/invites/${token}`,
    }),

    acceptInvite: build.mutation<
      { workspaceId: string; workspaceName: string; role: WorkspaceRole },
      string
    >({
      query: (token) => ({ url: `/api/invites/${token}/accept`, method: "POST" }),
      // The workspace list is what changes — they now have one more.
      invalidatesTags: ["Workspace"],
    }),


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
        /** Which workspace this plan period is for — plans are bought per workspace. */
        workspaceId: string;
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
      invalidatesTags: ["Billing", "Usage"],
    }),

    startAddonPurchase: build.mutation<
      StartAddonPurchaseResponse,
      { slug: string; workspaceId: string; couponCode?: string; currency: Currency; packs?: number }
    >({
      // Credits land on one workspace's subscription, so the purchase names it.
      query: ({ slug, workspaceId, couponCode, currency, packs }) => ({
        url: `/api/billing/addons/${slug}/purchase`,
        method: "POST",
        body: { workspaceId, couponCode, currency, packs },
      }),
    }),

    verifyAddonPurchase: build.mutation<
      { ok: true },
      { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
    >({
      query: (body) => ({ url: "/api/billing/addons/verify", method: "POST", body }),
      invalidatesTags: ["Billing", "Usage"],
    }),

    /**
     * Paid receipts, newest first. Plans and addon packs arrive as one merged
     * history — the server interleaves them, since that's how someone reading
     * their own billing thinks about it.
     *
     * Tagged "Billing" so completing a purchase pulls the new receipt in
     * without a manual refresh.
     */
    /**
     * Receipts for one workspace — everything else on the Billing page
     * describes the workspace being viewed, so the history has to as well.
     *
     * Still only the caller's own purchases: a member of a shared workspace
     * sees what they paid for, not their colleague's card statement.
     */
    getInvoices: build.query<Invoice[], { workspaceId: string }>({
      query: ({ workspaceId }) => `/api/billing/invoices?workspaceId=${workspaceId}`,
      providesTags: ["Billing"],
    }),

    /** Preview a coupon's discount against a known amount before checkout starts. */
    checkCoupon: build.mutation<CouponCheckResult, { amount: number; code: string }>({
      query: (body) => ({ url: "/api/billing/coupons/check", method: "POST", body }),
    }),


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

    /**
     * The Orbit AI tiers. Same story as the plans above — everything but price
     * is fixed in backend code, and they share the `Plan` tag so a currency
     * sync refreshes both ladders at once.
     */
    getAdminOrbitPlans: build.query<OrbitPlan[], void>({
      query: () => "/api/admin/billing/orbit-plans",
      providesTags: ["Plan"],
    }),

    saveAdminOrbitPlanPrice: build.mutation<
      OrbitPlan,
      { slug: string; priceMonthly: CurrencyPrices; priceYearly: CurrencyPrices }
    >({
      query: ({ slug, ...body }) => ({
        url: `/api/admin/billing/orbit-plans/${slug}`,
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
  useGetWorkspaceUsageQuery,
  useCreateWorkspaceMutation,
  useRenameWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetShareQuery,
  useSetShareMutation,
  useWriteShareCaptionMutation,
  usePlanScheduledPostMutation,
  useGetLinkedInStatusQuery,
  useGetInstagramStatusQuery,
  useDisconnectInstagramMutation,
  useDisconnectLinkedInMutation,
  usePostToLinkedInMutation,
  useGetScheduledPostsQuery,
  useGetSentPostsQuery,
  useDeleteSentPostMutation,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
  usePublishScheduledPostMutation,
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteOptionsMutation,
  useDeleteSiteMutation,
  useGetStatsQuery,
  useGetStatsCompareQuery,
  useComputeFunnelMutation,
  useGetFunnelsQuery,
  useCreateFunnelMutation,
  useUpdateFunnelMutation,
  useDeleteFunnelMutation,
  useGetUserFlowQuery,
  useGetRetentionQuery,
  useGetInstallStatusQuery,
  useLazyGetInstallStatusQuery,
  useGetLayoutQuery,
  useSaveLayoutMutation,
  useGetWorkspaceThemeQuery,
  useSaveWorkspaceThemeMutation,
  useGetAdminUsersQuery,
  useDeleteAdminUserMutation,
  useGetAdminUserBillingQuery,
  useGrantAdminSiteSlotMutation,
  useGetContactMessagesQuery,
  useGetContactUnreadQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
  useReplyToContactMessageMutation,
  useSendSupportMessageMutation,
  useGetOrbitStatusQuery,
  useAskOrbitMutation,
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
  useGetCompetitorAnalysisQuery,
  useGetCompetitorHistoryQuery,
  useAddCompetitorMutation,
  useRefreshCompetitorMutation,
  useRefreshAllCompetitorsMutation,
  useDeleteCompetitorMutation,
  useGetSearchTrafficQuery,
  useGetFieldVitalsQuery,
  useRunCrawlMutation,
  useGetLatestCrawlQuery,
  useGetMembersQuery,
  useInviteMemberMutation,
  useRevokeInviteMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetInviteQuery,
  useAcceptInviteMutation,
  useGetPlansQuery,
  useGetAddonPacksQuery,
  useStartSubscriptionMutation,
  useVerifySubscriptionMutation,
  useStartAddonPurchaseMutation,
  useVerifyAddonPurchaseMutation,
  useGetAdminPlansQuery,
  useSaveAdminPlanPriceMutation,
  useGetAdminOrbitPlansQuery,
  useSaveAdminOrbitPlanPriceMutation,
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
  useGetSegmentsQuery,
  useSaveSegmentMutation,
  useUpdateSegmentMutation,
  useDeleteSegmentMutation,
  useGetJourneyUsersQuery,
  useGetJourneyTimelineQuery,
  useGetMarkersQuery,
  useSaveMarkerMutation,
  useUpdateMarkerMutation,
  useDeleteMarkerMutation,
  useGetAdminCouponsQuery,
  useSaveAdminCouponMutation,
  useDeleteAdminCouponMutation,
} = api;
