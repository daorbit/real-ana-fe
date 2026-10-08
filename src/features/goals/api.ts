import { api } from "@/app/store/api";
import type { TargetInput, TargetProgress } from "@/features/goals/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["Target"] }).injectEndpoints({
  endpoints: (build) => ({
    getTargets: build.query<TargetProgress[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/targets`,
      providesTags: ["Target"],
    }),
  }),
});

const goalsApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createTarget: build.mutation<TargetProgress, TargetInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/targets`,
        method: "POST",
        body,
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getTargets", workspaceId, (list) => {
          list.push(data);
        }));
      },
    }),

    updateTarget: build.mutation<TargetProgress, TargetInput & { workspaceId: string; id: string }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/targets/${id}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getTargets", workspaceId, (list) => {
          const i = list.findIndex((t) => t.id === id);
          if (i >= 0) list[i] = data;
        }));
      },
    }),

    deleteTarget: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/targets/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const ok = await queryFulfilled.then(() => true, () => false);
        if (!ok) return;
        dispatch(queries.util.updateQueryData("getTargets", workspaceId, (list) =>
          list.filter((t) => t.id !== id)
        ));
      },
    }),
  }),
});

export const { useGetTargetsQuery } = queries;

export const {
  useCreateTargetMutation,
  useUpdateTargetMutation,
  useDeleteTargetMutation,
} = goalsApi;
