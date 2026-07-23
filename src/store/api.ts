import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "../api";
import type {
  AdminUserPage, ApiKey, Site, Stats, Workspace,
  FunnelStepInput, FunnelResultStep, RetentionCohort, Goal,
} from "../types";
import type { Placed } from "../hooks/useHomeWidgets";
import type { TrackerOptions } from "../utils/tracker";
import type { ShareState, SharePanels, SeoReport, SeoReportSummary } from "../types";

const BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * One cache for every server resource.
 *
 * RTK Query dedupes concurrent requests for the same key, keeps the result in
 * the store, and serves it instantly on the next mount — so navigating between
 * pages no longer refires the same calls. Data only goes stale when a poll
 * fires, a mutation invalidates its tag, or the user hits Refresh.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Workspace", "Site", "Stats", "ApiKey", "InstallStatus", "Layout", "AdminUser", "Goal", "Share", "Seo"],
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
} = api;
