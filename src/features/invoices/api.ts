import { api } from "@/app/store/api";
import { invoicesQuery } from "@/features/invoices/lib/invoicesClient";
import type { InvoiceSummary, InvoicesOverview, RecentInvoice } from "@/features/invoices/widgetTypes";

type Envelope<T> = { success: boolean; data: T };

const RECENT_LIMIT = 5;

const invoicesWidgetApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInvoicesOverview: build.query<InvoicesOverview, string>({
      queryFn: async (workspaceId, queryApi, extra, baseQuery) => {
        const [stats, recent] = await Promise.all([
          invoicesQuery<Envelope<InvoiceSummary>>({ workspaceId, path: "/dashboard/stats" }, queryApi, extra, baseQuery),
          invoicesQuery<Envelope<RecentInvoice[]>>(
            { workspaceId, path: `/dashboard/recent?limit=${RECENT_LIMIT * 2}` },
            queryApi,
            extra,
            baseQuery,
          ),
        ]);
        if ("error" in stats) return stats;
        if ("error" in recent) return recent;
        return {
          data: {
            summary: stats.data.data,
            recent: recent.data.data.filter((row) => row.type === "invoice").slice(0, RECENT_LIMIT),
          },
        };
      },
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetInvoicesOverviewQuery } = invoicesWidgetApi;
