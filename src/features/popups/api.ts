import { api } from "@/app/store/api";
import { formsQuery } from "@/features/integrations/lib/formsClient";
import type { FormOption, Popup, PopupInput, PopupsResponse } from "@/features/popups/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["Popups"] }).injectEndpoints({
  endpoints: (build) => ({
    getPopups: build.query<PopupsResponse, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/popups`,
      providesTags: ["Popups"],
    }),

    getPublishedForms: build.query<FormOption[], string>({
      queryFn: async (workspaceId, queryApi, extra, baseQuery) => {
        const result = await formsQuery<{ items: FormOption[] }>(
          { workspaceId, area: "forms", path: "?status=published&limit=100" },
          queryApi,
          extra,
          baseQuery,
        );
        return "error" in result ? result : { data: result.data.items ?? [] };
      },
    }),
  }),
});

const popupsApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createPopup: build.mutation<Popup, PopupInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({ url: `/api/workspaces/${workspaceId}/popups`, method: "POST", body }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getPopups", workspaceId, (draft) => {
          draft.popups.push(data);
        }));
      },
    }),

    updatePopup: build.mutation<Popup, PopupInput & { workspaceId: string; id: string }>({
      query: ({ workspaceId, id, ...body }) => ({ url: `/api/workspaces/${workspaceId}/popups/${id}`, method: "PUT", body }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getPopups", workspaceId, (draft) => {
          const i = draft.popups.findIndex((p) => p.id === id);
          if (i >= 0) draft.popups[i] = { ...data, stats: draft.popups[i].stats };
        }));
      },
    }),

    deletePopup: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({ url: `/api/workspaces/${workspaceId}/popups/${id}`, method: "DELETE" }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const ok = await queryFulfilled.then(() => true, () => false);
        if (!ok) return;
        dispatch(queries.util.updateQueryData("getPopups", workspaceId, (draft) => {
          draft.popups = draft.popups.filter((p) => p.id !== id);
        }));
      },
    }),
  }),
});

export const { useGetPopupsQuery, useGetPublishedFormsQuery } = queries;
export const { useCreatePopupMutation, useUpdatePopupMutation, useDeletePopupMutation } = popupsApi;
