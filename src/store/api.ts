import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "../api";
import type { ApiKey, Site, Stats, Workspace } from "../types";
import type { Placed } from "../hooks/useHomeWidgets";

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
  tagTypes: ["Workspace", "Site", "Stats", "ApiKey", "InstallStatus", "Layout"],
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

    /* -------------------------------- sites ------------------------------- */
    getSites: build.query<Site[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/sites`,
      providesTags: (result, _e, workspaceId) => [
        { type: "Site", id: `LIST-${workspaceId}` },
        ...(result ?? []).map((s) => ({ type: "Site" as const, id: s.siteId })),
      ],
    }),

    createSite: build.mutation<Site, { workspaceId: string; name: string; domain: string }>({
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
    getStats: build.query<Stats, { workspaceId: string; range: string }>({
      query: ({ workspaceId, range }) =>
        `/api/workspaces/${workspaceId}/stats?range=${range}`,
      providesTags: (_r, _e, { workspaceId, range }) => [
        { type: "Stats", id: `${workspaceId}-${range}` },
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
  }),
});

export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useRenameWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetSitesQuery,
  useCreateSiteMutation,
  useDeleteSiteMutation,
  useGetStatsQuery,
  useGetInstallStatusQuery,
  useLazyGetInstallStatusQuery,
  useGetLayoutQuery,
  useSaveLayoutMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = api;
