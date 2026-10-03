import { api } from "@/app/store/api";
import type {
  Backlink, BacklinkOverview, CompetitorBacklink, DiscoverResult, IndexSyncResult, PageCheckResult,
  SiteArgs, VerifySummary,
} from "./types";

const base = ({ workspaceId, siteId }: SiteArgs) => `/api/workspaces/${workspaceId}/sites/${siteId}/backlinks`;

const backlinksApi = api.enhanceEndpoints({ addTagTypes: ["Backlink"] }).injectEndpoints({
  endpoints: (build) => ({
    getBacklinks: build.query<Backlink[], SiteArgs>({
      query: (args) => base(args),
      providesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    getBacklinkOverview: build.query<BacklinkOverview, SiteArgs>({
      query: (args) => `${base(args)}/overview`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    getCompetitorBacklinks: build.query<CompetitorBacklink[], SiteArgs & { competitorId: string }>({
      query: ({ competitorId, ...args }) => `${base(args)}/competitors/${competitorId}`,
      providesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    discoverBacklinks: build.mutation<DiscoverResult, SiteArgs>({
      query: (args) => ({ url: `${base(args)}/discover`, method: "POST" }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    recheckBacklinks: build.mutation<VerifySummary & { remaining: number }, SiteArgs>({
      query: (args) => ({ url: `${base(args)}/recheck`, method: "POST" }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    recheckBacklink: build.mutation<Backlink, SiteArgs & { backlinkId: string }>({
      query: ({ backlinkId, ...args }) => ({ url: `${base(args)}/${backlinkId}/recheck`, method: "POST" }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    addBacklink: build.mutation<Backlink, SiteArgs & { url: string }>({
      query: ({ url, ...args }) => ({ url: base(args), method: "POST", body: { url } }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    checkBacklinkPage: build.mutation<PageCheckResult, SiteArgs & { url: string }>({
      query: ({ url, ...args }) => ({ url: `${base(args)}/check-page`, method: "POST", body: { url } }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    syncBacklinkIndex: build.mutation<IndexSyncResult, SiteArgs>({
      query: (args) => ({ url: `${base(args)}/index-sync`, method: "POST" }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),

    deleteBacklink: build.mutation<void, SiteArgs & { backlinkId: string }>({
      query: ({ backlinkId, ...args }) => ({ url: `${base(args)}/${backlinkId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { siteId }) => [{ type: "Backlink", id: siteId }],
    }),
  }),
});

export const {
  useGetBacklinksQuery,
  useGetBacklinkOverviewQuery,
  useGetCompetitorBacklinksQuery,
  useDiscoverBacklinksMutation,
  useRecheckBacklinksMutation,
  useRecheckBacklinkMutation,
  useAddBacklinkMutation,
  useCheckBacklinkPageMutation,
  useSyncBacklinkIndexMutation,
  useDeleteBacklinkMutation,
} = backlinksApi;
