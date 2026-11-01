import { api } from "@/app/store/api";
import type { Experiment, ExperimentDetail, ExperimentInput, ExperimentsResponse } from "@/features/experiments/types";

type IdArgs = { workspaceId: string; id: string };

const tags = api.enhanceEndpoints({ addTagTypes: ["Experiments", "Experiment"] });

const queries = tags.injectEndpoints({
  endpoints: (build) => ({
    getExperiments: build.query<ExperimentsResponse, string>({
      query: (workspaceId) => `/api/workspaces/${workspaceId}/experiments`,
      providesTags: ["Experiments"],
    }),

    getExperiment: build.query<ExperimentDetail, IdArgs>({
      query: ({ workspaceId, id }) => `/api/workspaces/${workspaceId}/experiments/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: "Experiment", id }],
    }),
  }),
});

function changed(id: string) {
  return ["Experiments" as const, { type: "Experiment" as const, id }];
}

const experimentsApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createExperiment: build.mutation<Experiment, ExperimentInput & { workspaceId: string }>({
      query: ({ workspaceId, ...body }) => ({ url: `/api/workspaces/${workspaceId}/experiments`, method: "POST", body }),
      invalidatesTags: ["Experiments"],
    }),

    updateExperiment: build.mutation<Experiment, ExperimentInput & IdArgs>({
      query: ({ workspaceId, id, ...body }) => ({ url: `/api/workspaces/${workspaceId}/experiments/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),

    deleteExperiment: build.mutation<void, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `/api/workspaces/${workspaceId}/experiments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Experiments"],
    }),

    startExperiment: build.mutation<Experiment, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `/api/workspaces/${workspaceId}/experiments/${id}/start`, method: "POST" }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),

    pauseExperiment: build.mutation<Experiment, IdArgs>({
      query: ({ workspaceId, id }) => ({ url: `/api/workspaces/${workspaceId}/experiments/${id}/pause`, method: "POST" }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),

    endExperiment: build.mutation<Experiment, IdArgs & { winner: string; keepWinner: boolean }>({
      query: ({ workspaceId, id, winner, keepWinner }) => ({
        url: `/api/workspaces/${workspaceId}/experiments/${id}/end`,
        method: "POST",
        body: { winner, keepWinner },
      }),
      invalidatesTags: (_result, _error, { id }) => changed(id),
    }),
  }),
});

export const { useGetExperimentsQuery, useGetExperimentQuery } = queries;
export const {
  useCreateExperimentMutation,
  useUpdateExperimentMutation,
  useDeleteExperimentMutation,
  useStartExperimentMutation,
  usePauseExperimentMutation,
  useEndExperimentMutation,
} = experimentsApi;
