import { api } from "@/app/store/api";
import type { BioPage, BioPageInput, BioPagesResponse } from "@/features/bio/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["BioPages"] }).injectEndpoints({
  endpoints: (build) => ({
    getBioPages: build.query<BioPagesResponse, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/bio`,
      providesTags: ["BioPages"],
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
  }),
});

export const { useGetBioPagesQuery } = queries;
export const { useCreateBioPageMutation, useUpdateBioPageMutation, useDeleteBioPageMutation } = bioApi;
