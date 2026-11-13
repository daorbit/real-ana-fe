import { useDemo } from "@/features/demo/context";
import {
  demoRadarDetail,
  demoRadarHistory,
  demoRadarOverview,
  demoRadarScans,
  demoRadarSettings,
  demoRadarSnoozed,
} from "@/features/demo/demoGrowthRadar";
import {
  useGetRadarOpportunitiesQuery,
  useGetRadarOpportunityQuery,
  useGetRadarOverviewQuery,
  useGetRadarScansQuery,
  useGetRadarSettingsQuery,
} from "../api";
import type { RadarListView } from "../types";

export function useRadarOverview(workspaceId: string, enabled: boolean) {
  const { demo } = useDemo();
  const query = useGetRadarOverviewQuery(workspaceId, { skip: !workspaceId || !enabled || demo });
  return {
    overview: demo ? demoRadarOverview : query.currentData,
    loading: !demo && query.isLoading,
    failed: !demo && query.isError,
    refetch: query.refetch,
  };
}

export function useRadarList(workspaceId: string, view: RadarListView, before: string | undefined, enabled: boolean) {
  const { demo } = useDemo();
  const query = useGetRadarOpportunitiesQuery({ workspaceId, view, before }, { skip: !workspaceId || !enabled || demo });
  return {
    list: demo ? (view === "history" ? demoRadarHistory : demoRadarSnoozed) : query.currentData,
    loading: !demo && query.isLoading,
    fetching: !demo && query.isFetching,
  };
}

export function useRadarScans(workspaceId: string, enabled: boolean) {
  const { demo } = useDemo();
  const query = useGetRadarScansQuery(workspaceId, { skip: !workspaceId || !enabled || demo });
  return { scans: demo ? demoRadarScans.scans : query.currentData?.scans, loading: !demo && query.isLoading };
}

export function useRadarSettings(workspaceId: string, enabled: boolean) {
  const { demo } = useDemo();
  const query = useGetRadarSettingsQuery(workspaceId, { skip: !workspaceId || !enabled || demo });
  return { settings: demo ? demoRadarSettings : query.currentData, loading: !demo && query.isLoading, failed: !demo && query.isError };
}

export function useRadarOpportunity(workspaceId: string, id: string, enabled: boolean) {
  const { demo } = useDemo();
  const query = useGetRadarOpportunityQuery({ workspaceId, id }, { skip: !workspaceId || !id || !enabled || demo });
  return {
    detail: demo ? demoRadarDetail(id) : query.currentData,
    loading: !demo && query.isLoading,
    notFound: demo ? !demoRadarDetail(id) : query.isError,
  };
}
