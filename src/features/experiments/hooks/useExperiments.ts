import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useDemo } from "@/features/demo/context";
import { demoExperiments } from "@/features/demo/demoExperiments";
import { useGetExperimentsQuery } from "@/features/experiments/api";
import type { Experiment } from "@/features/experiments/types";

const EMPTY: Experiment[] = [];

export function useExperiments(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const query = useGetExperimentsQuery(workspaceId && !demo ? workspaceId : skipToken);
  const sample = useMemo(() => (demo ? demoExperiments() : null), [demo]);
  const data = sample ?? query.currentData;

  return {
    experiments: data?.experiments ?? EMPTY,
    limit: data?.limit ?? 1,
    running: data?.running ?? 0,
    plan: data?.plan ?? "",
    loading: !sample && query.isLoading,
    failed: !sample && query.isError && !query.currentData,
    refetch: query.refetch,
  };
}
