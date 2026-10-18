import { api } from "@/app/store/api";
import type { AlertConfig, AlertsOverview, AlertTestReport } from "@/features/alerts/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["Alerts"] }).injectEndpoints({
  endpoints: (build) => ({
    getAlerts: build.query<AlertsOverview, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/alerts`,
      providesTags: ["Alerts"],
    }),
  }),
});

const alertsApi = queries.injectEndpoints({
  endpoints: (build) => ({
    saveAlerts: build.mutation<AlertsOverview, AlertConfig & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/alerts`,
        method: "PUT",
        body,
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getAlerts", workspaceId, data));
      },
    }),

    testAlerts: build.mutation<AlertTestReport, string>({
      query: (workspaceId) => ({ url: `/api/workspaces/${workspaceId}/alerts/test`, method: "POST" }),
    }),
  }),
});

export const { useGetAlertsQuery } = queries;
export const { useSaveAlertsMutation, useTestAlertsMutation } = alertsApi;
