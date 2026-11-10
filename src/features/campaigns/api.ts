import { api } from "@/app/store/api";
import type {
  Campaign,
  CampaignAudience,
  CampaignFailure,
  CampaignInput,
  CampaignSources,
  CampaignsResponse,
} from "@/features/campaigns/types";

type IdArgs = { workspaceId: string; id: string };

const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/campaigns`;

const tags = api.enhanceEndpoints({ addTagTypes: ["Campaigns", "Campaign"] });

function changed(id: string) {
  return ["Campaigns" as const, { type: "Campaign" as const, id }];
}

const campaignsApi = tags.injectEndpoints({
  endpoints: (build) => ({
    getCampaigns: build.query<CampaignsResponse, string>({
      query: (workspaceId) => base(workspaceId),
      providesTags: ["Campaigns"],
    }),

    getCampaignSources: build.query<CampaignSources, string>({
      query: (workspaceId) => `${base(workspaceId)}/sources`,
    }),

    getCampaign: build.query<Campaign, IdArgs>({
      query: ({ workspaceId, id }) => `${base(workspaceId)}/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: "Campaign", id }],
    }),

    getCampaignFailures: build.query<{ failures: CampaignFailure[] }, IdArgs>({
      query: ({ workspaceId, id }) => `${base(workspaceId)}/${id}/failures`,
      providesTags: (_result, _error, { id }) => [{ type: "Campaign", id }],
    }),

    previewCampaign: build.mutation<{ html: string }, CampaignInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({ url: `${base(workspaceId)}/preview`, method: "POST", body }),
    }),

    createCampaign: build.mutation<Campaign, CampaignInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({ url: base(workspaceId), method: "POST", body }),
      invalidatesTags: ["Campaigns"],
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(campaignsApi.util.upsertQueryData("getCampaign", { workspaceId, id: data.id }, data));
        } catch {
          return;
        }
      },
    }),

    updateCampaign: build.mutation<Campaign, CampaignInput & IdArgs>({
      query: ({ workspaceId, id, ...body }) => ({ url: `${base(workspaceId)}/${id}`, method: "PUT", body }),
      invalidatesTags: ["Campaigns"],
    }),

    deleteCampaign: build.mutation<void, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Campaigns"],
    }),

    checkCampaignAudience: build.mutation<CampaignAudience, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}/audience`, method: "POST" }),
    }),

    testCampaign: build.mutation<{ ok: boolean }, IdArgs & { to: string }>({
      query: ({ workspaceId, id, to }) => ({ url: `${base(workspaceId)}/${id}/test`, method: "POST", body: { to } }),
    }),

    sendCampaign: build.mutation<Campaign, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}/send`, method: "POST", body: { consent: true } }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),

    pauseCampaign: build.mutation<Campaign, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}/pause`, method: "POST" }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),

    resumeCampaign: build.mutation<Campaign, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}/resume`, method: "POST" }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignSourcesQuery,
  useGetCampaignQuery,
  useGetCampaignFailuresQuery,
  usePreviewCampaignMutation,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useCheckCampaignAudienceMutation,
  useTestCampaignMutation,
  useSendCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
} = campaignsApi;
