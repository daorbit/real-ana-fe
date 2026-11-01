import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/features/demo/context";
import { demoExperimentDetail } from "@/features/demo/demoExperiments";
import { notify, notifyError } from "@/shared/lib/notify";
import {
  useDeleteExperimentMutation,
  useEndExperimentMutation,
  useGetExperimentQuery,
  usePauseExperimentMutation,
  useStartExperimentMutation,
} from "@/features/experiments/api";

const DEMO_READ_ONLY = "Demo data is read-only. Turn off demo mode to run tests.";

export function useExperimentDetail(workspaceId: string | undefined, id: string | undefined) {
  const { demo } = useDemo();
  const navigate = useNavigate();
  const query = useGetExperimentQuery(workspaceId && id && !demo ? { workspaceId, id } : skipToken);
  const sample = useMemo(() => (demo && id ? demoExperimentDetail(id) : null), [demo, id]);
  const [start, starting] = useStartExperimentMutation();
  const [pause, pausing] = usePauseExperimentMutation();
  const [end, ending] = useEndExperimentMutation();
  const [remove, removing] = useDeleteExperimentMutation();

  const run = useCallback(
    async (action: () => Promise<unknown>, done: string) => {
      if (demo) {
        notify.error(DEMO_READ_ONLY);
        return false;
      }
      try {
        await action();
        notify.success(done);
        return true;
      } catch (e) {
        notifyError(e);
        return false;
      }
    },
    [demo],
  );

  const args = workspaceId && id ? { workspaceId, id } : null;

  return {
    detail: sample ?? query.currentData,
    loading: !sample && query.isLoading,
    failed: !sample && query.isError && !query.currentData,
    refreshing: query.isFetching,
    refresh: query.refetch,
    lastUpdated: query.fulfilledTimeStamp ? new Date(query.fulfilledTimeStamp) : null,
    busy: starting.isLoading || pausing.isLoading || ending.isLoading || removing.isLoading,
    start: () => (args ? run(() => start(args).unwrap(), "Test started. Visitors are being split now.") : Promise.resolve(false)),
    pause: () => (args ? run(() => pause(args).unwrap(), "Test paused. Everyone sees the original.") : Promise.resolve(false)),
    end: (winner: string, keepWinner: boolean) =>
      args ? run(() => end({ ...args, winner, keepWinner }).unwrap(), "Test ended.") : Promise.resolve(false),
    remove: async () => {
      if (!args) return;
      if (await run(() => remove(args).unwrap(), "Test deleted.")) navigate("/app/experiments");
    },
  };
}
