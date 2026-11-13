import { api } from "@/app/store/api";
import type { AdminStatusOverview, IncidentDraft, IncidentEdit, StatusIncident, UpdateDraft } from "./types";

const BASE = "/api/admin/status";
const TAG = { type: "AdminStatus" as const, id: "overview" };

const statusApi = api.enhanceEndpoints({ addTagTypes: ["AdminStatus"] }).injectEndpoints({
  endpoints: (build) => ({
    getAdminStatus: build.query<AdminStatusOverview, void>({
      query: () => BASE,
      providesTags: [TAG],
    }),

    createStatusIncident: build.mutation<StatusIncident, IncidentDraft>({
      query: (body) => ({ url: `${BASE}/incidents`, method: "POST", body }),
      invalidatesTags: [TAG],
    }),

    postStatusUpdate: build.mutation<StatusIncident, { id: string; update: UpdateDraft }>({
      query: ({ id, update }) => ({ url: `${BASE}/incidents/${id}/updates`, method: "POST", body: update }),
      invalidatesTags: [TAG],
    }),

    editStatusIncident: build.mutation<StatusIncident, { id: string; edit: IncidentEdit }>({
      query: ({ id, edit }) => ({ url: `${BASE}/incidents/${id}`, method: "PATCH", body: edit }),
      invalidatesTags: [TAG],
    }),

    deleteStatusIncident: build.mutation<void, string>({
      query: (id) => ({ url: `${BASE}/incidents/${id}`, method: "DELETE" }),
      invalidatesTags: [TAG],
    }),
  }),
});

export const {
  useGetAdminStatusQuery,
  useCreateStatusIncidentMutation,
  usePostStatusUpdateMutation,
  useEditStatusIncidentMutation,
  useDeleteStatusIncidentMutation,
} = statusApi;
