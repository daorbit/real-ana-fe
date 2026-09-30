import { api } from "@/app/store/api";
import type { Dashboard, DashboardInput, Embed, EmbedInput } from "@/features/dashboards/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["Dashboard", "Embed"] }).injectEndpoints({
  endpoints: (build) => ({
    getDashboards: build.query<Dashboard[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/dashboards`,
      providesTags: [{ type: "Dashboard", id: "LIST" }],
    }),

    getDashboard: build.query<Dashboard, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `/api/workspaces/${workspaceId}/dashboards/${id}`,
      providesTags: (_r, _e, { id }) => [{ type: "Dashboard", id }],
    }),

    getEmbeds: build.query<Embed[], string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/embeds`,
      providesTags: ["Embed"],
    }),
  }),
});

export const dashboardsApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createDashboard: build.mutation<Dashboard, DashboardInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/dashboards`,
        method: "POST",
        body,
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.upsertQueryData("getDashboard", { workspaceId, id: data.id }, data));
        dispatch(queries.util.updateQueryData("getDashboards", workspaceId, (list) => {
          list.unshift(data);
        }));
      },
    }),

    updateDashboard: build.mutation<Dashboard, DashboardInput & { workspaceId: string; id: string }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/dashboards/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.upsertQueryData("getDashboard", { workspaceId, id }, data));
        dispatch(queries.util.updateQueryData("getDashboards", workspaceId, (list) => {
          const i = list.findIndex((d) => d.id === id);
          if (i >= 0) list[i] = data;
        }));
      },
    }),

    duplicateDashboard: build.mutation<Dashboard, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/dashboards/${id}/duplicate`,
        method: "POST",
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.upsertQueryData("getDashboard", { workspaceId, id: data.id }, data));
        dispatch(queries.util.updateQueryData("getDashboards", workspaceId, (list) => {
          list.unshift(data);
        }));
      },
    }),

    deleteDashboard: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/dashboards/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const ok = await queryFulfilled.then(() => true, () => false);
        if (!ok) return;
        dispatch(queries.util.updateQueryData("getDashboards", workspaceId, (list) =>
          list.filter((d) => d.id !== id)
        ));
      },
    }),

    createEmbed: build.mutation<Embed, EmbedInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/embeds`,
        method: "POST",
        body,
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getEmbeds", workspaceId, (list) => {
          if (!list.some((e) => e.id === data.id)) list.unshift(data);
        }));
      },
      invalidatesTags: ["Embed"],
    }),

    updateEmbed: build.mutation<Embed, EmbedInput & { workspaceId: string; id: string }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/api/workspaces/${workspaceId}/embeds/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ workspaceId, id, ...patch }, { dispatch, queryFulfilled }) {
        const undo = dispatch(queries.util.updateQueryData("getEmbeds", workspaceId, (list) => {
          const e = list.find((x) => x.id === id);
          if (e) Object.assign(e, patch);
        }));
        await queryFulfilled.catch(() => undo.undo());
      },
    }),

    deleteEmbed: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/api/workspaces/${workspaceId}/embeds/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const ok = await queryFulfilled.then(() => true, () => false);
        if (!ok) return;
        dispatch(queries.util.updateQueryData("getEmbeds", workspaceId, (list) =>
          list.filter((e) => e.id !== id)
        ));
      },
    }),
  }),
});

export const {
  useGetDashboardsQuery,
  useGetDashboardQuery,
  useGetEmbedsQuery,
} = queries;

export const {
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDuplicateDashboardMutation,
  useDeleteDashboardMutation,
  useCreateEmbedMutation,
  useUpdateEmbedMutation,
  useDeleteEmbedMutation,
} = dashboardsApi;
