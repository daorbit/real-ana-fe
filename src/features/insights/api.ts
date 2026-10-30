import { api } from "@/app/store/api";
import type { InsightDigest, InsightsOverview } from "./types";

const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/insights`;

const insightsApi = api.enhanceEndpoints({ addTagTypes: ["Insights"] }).injectEndpoints({
  endpoints: (build) => ({
    getInsights: build.query<InsightsOverview, string>({
      query: (workspaceId) => base(workspaceId),
      providesTags: (_r, _e, workspaceId) => [{ type: "Insights", id: workspaceId }],
    }),

    getInsightDigest: build.query<InsightDigest, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `${base(workspaceId)}/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: "Insights", id }],
    }),

    refreshInsights: build.mutation<InsightDigest, string>({
      query: (workspaceId) => ({ url: `${base(workspaceId)}/refresh`, method: "POST" }),
      invalidatesTags: (_r, _e, workspaceId) => [{ type: "Insights", id: workspaceId }],
    }),
  }),
});

export const { useGetInsightsQuery, useGetInsightDigestQuery, useRefreshInsightsMutation } = insightsApi;
