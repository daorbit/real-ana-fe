import { api } from "@/app/store/api";
import type {
  ActionDraft,
  OpportunityDetail,
  OpportunityPatch,
  RadarConfig,
  RadarList,
  RadarListView,
  RadarOverview,
  RadarScan,
  RadarSettings,
} from "./types";

const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/growth-radar`;

type DetailArgs = { workspaceId: string; id: string };

const queries = api.enhanceEndpoints({ addTagTypes: ["GrowthRadar"] }).injectEndpoints({
  endpoints: (build) => ({
    getRadarOverview: build.query<RadarOverview, string>({
      query: (workspaceId) => base(workspaceId),
      providesTags: (_r, _e, workspaceId) => [{ type: "GrowthRadar", id: `overview:${workspaceId}` }],
    }),

    getRadarOpportunities: build.query<RadarList, { workspaceId: string; view: RadarListView; before?: string }>({
      query: ({ workspaceId, view, before }) => ({
        url: `${base(workspaceId)}/opportunities`,
        params: before ? { view, before } : { view },
      }),
      providesTags: (_r, _e, { workspaceId }) => [{ type: "GrowthRadar", id: `lists:${workspaceId}` }],
    }),

    getRadarOpportunity: build.query<OpportunityDetail, DetailArgs>({
      query: ({ workspaceId, id }) => `${base(workspaceId)}/opportunities/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: "GrowthRadar", id }],
    }),

    getRadarScans: build.query<{ scans: RadarScan[] }, string>({
      query: (workspaceId) => `${base(workspaceId)}/scans`,
      providesTags: (_r, _e, workspaceId) => [{ type: "GrowthRadar", id: `scans:${workspaceId}` }],
    }),

    getRadarSettings: build.query<RadarSettings, string>({
      query: (workspaceId) => `${base(workspaceId)}/settings`,
      providesTags: (_r, _e, workspaceId) => [{ type: "GrowthRadar", id: `settings:${workspaceId}` }],
    }),
  }),
});

const mutations = queries.injectEndpoints({
  endpoints: (build) => ({
    saveRadarSettings: build.mutation<RadarSettings, { workspaceId: string; config: RadarConfig }>({
      query: ({ workspaceId, config }) => ({ url: `${base(workspaceId)}/settings`, method: "PUT", body: config }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getRadarSettings", workspaceId, data));
      },
    }),

    runRadarScan: build.mutation<RadarOverview, string>({
      query: (workspaceId) => ({ url: `${base(workspaceId)}/scan`, method: "POST" }),
      async onQueryStarted(workspaceId, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getRadarOverview", workspaceId, data));
      },
      invalidatesTags: (_r, _e, workspaceId) => [
        { type: "GrowthRadar", id: `lists:${workspaceId}` },
        { type: "GrowthRadar", id: `scans:${workspaceId}` },
      ],
    }),

    updateRadarOpportunity: build.mutation<OpportunityDetail, DetailArgs & { patch: OpportunityPatch }>({
      query: ({ workspaceId, id, patch }) => ({ url: `${base(workspaceId)}/opportunities/${id}`, method: "PATCH", body: patch }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getRadarOpportunity", { workspaceId, id }, data));
      },
      invalidatesTags: (_r, _e, { workspaceId }) => [
        { type: "GrowthRadar", id: `overview:${workspaceId}` },
        { type: "GrowthRadar", id: `lists:${workspaceId}` },
      ],
    }),

    addRadarNote: build.mutation<OpportunityDetail, DetailArgs & { text: string }>({
      query: ({ workspaceId, id, text }) => ({ url: `${base(workspaceId)}/opportunities/${id}/notes`, method: "POST", body: { text } }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getRadarOpportunity", { workspaceId, id }, data));
      },
    }),

    recordRadarAction: build.mutation<OpportunityDetail, DetailArgs & { action: ActionDraft }>({
      query: ({ workspaceId, id, action }) => ({ url: `${base(workspaceId)}/opportunities/${id}/action`, method: "POST", body: action }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (data) dispatch(queries.util.upsertQueryData("getRadarOpportunity", { workspaceId, id }, data));
      },
      invalidatesTags: (_r, _e, { workspaceId }) => [{ type: "GrowthRadar", id: `overview:${workspaceId}` }],
    }),
  }),
});

export const {
  useGetRadarOverviewQuery,
  useGetRadarOpportunitiesQuery,
  useGetRadarOpportunityQuery,
  useGetRadarScansQuery,
  useGetRadarSettingsQuery,
} = queries;

export const {
  useSaveRadarSettingsMutation,
  useRunRadarScanMutation,
  useUpdateRadarOpportunityMutation,
  useAddRadarNoteMutation,
  useRecordRadarActionMutation,
} = mutations;
