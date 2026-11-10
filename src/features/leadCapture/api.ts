import { api } from "@/app/store/api";
import { formsQuery } from "@/features/integrations/lib/formsClient";
import type { LeadPipeline } from "@/features/leadCapture/types";

const leadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLeadPipeline: build.query<LeadPipeline, string>({
      queryFn: (workspaceId, queryApi, extra, baseQuery) =>
        formsQuery<LeadPipeline>({ workspaceId, area: "forms", path: "/pipeline-summary" }, queryApi, extra, baseQuery),
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetLeadPipelineQuery } = leadsApi;
