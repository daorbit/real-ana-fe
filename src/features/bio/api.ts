import { api } from "@/app/store/api";
import type { BioPage, BioPageInput, BioPageStatsDetail, BioPagesResponse, BioResolvedLink } from "@/features/bio/types";

type StatsArgs = { workspaceId: string; id: string; days: number };

const queries = api.enhanceEndpoints({ addTagTypes: ["BioPages", "BioStats"] }).injectEndpoints({
  endpoints: (build) => ({
    getBioPages: build.query<BioPagesResponse, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/bio`,
      providesTags: ["BioPages"],
    }),

    getBioPageStats: build.query<BioPageStatsDetail, StatsArgs>({
      query: ({ workspaceId, id, days }) => `/api/workspaces/${workspaceId}/bio/${id}/stats?days=${days}`,
      providesTags: (_r, _e, { id }) => [{ type: "BioStats", id }],
    }),
  }),
});

const bioApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createBioPage: build.mutation<BioPage, BioPageInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({ url: `/api/workspaces/${workspaceId}/bio`, method: "POST", body }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getBioPages", workspaceId, (draft) => {
          draft.pages.push(data);
        }));
      },
    }),

    updateBioPage: build.mutation<BioPage, BioPageInput & { workspaceId: string; id: string }>({
      query: ({ workspaceId, id, ...body }) => ({ url: `/api/workspaces/${workspaceId}/bio/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "BioStats", id }],
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getBioPages", workspaceId, (draft) => {
          const i = draft.pages.findIndex((p) => p.id === id);
          if (i >= 0) draft.pages[i] = { ...data, stats: draft.pages[i].stats };
        }));
      },
    }),

    deleteBioPage: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({ url: `/api/workspaces/${workspaceId}/bio/${id}`, method: "DELETE" }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const ok = await queryFulfilled.then(() => true, () => false);
        if (!ok) return;
        dispatch(queries.util.updateQueryData("getBioPages", workspaceId, (draft) => {
          draft.pages = draft.pages.filter((p) => p.id !== id);
        }));
      },
    }),

    resolveBioLink: build.mutation<BioResolvedLink, { workspaceId: string; url: string }>({
      query: ({ workspaceId, url }) => ({ url: `/api/workspaces/${workspaceId}/bio/resolve`, method: "POST", body: { url } }),
    }),
  }),
});

export const { useGetBioPagesQuery, useGetBioPageStatsQuery } = queries;
export const { useCreateBioPageMutation, useUpdateBioPageMutation, useDeleteBioPageMutation, useResolveBioLinkMutation } = bioApi;
