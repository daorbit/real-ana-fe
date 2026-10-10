import { useMemo, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWorkspaceAuditQuery } from "@/app/store";
import { demoAuditPage } from "@/features/demo/demoAudit";
import type { AuditSummary, WorkspaceAuditPage } from "@/shared/types";
import type { WorkspaceAuditCategory } from "../lib/categories";

const REFRESH_AFTER_S = 30;

type Overview = { workspaceId: string | null; summary: AuditSummary; retention: WorkspaceAuditPage["retention"] };

export function useWorkspaceAudit(workspaceId: string | null, { demo, enabled }: { demo: boolean; enabled: boolean }) {
  const [category, setCategoryState] = useState<WorkspaceAuditCategory | null>(null);
  const [actor, setActorState] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const lastOverview = useRef<Overview | null>(null);

  const { data: cached, originalArgs, isFetching, isError, refetch } = useGetWorkspaceAuditQuery(
    enabled && !demo && workspaceId ? { workspaceId, category, actor, cursor } : skipToken,
    { refetchOnMountOrArgChange: REFRESH_AFTER_S },
  );
  const matches =
    originalArgs?.workspaceId === workspaceId &&
    (originalArgs?.category ?? null) === category &&
    (originalArgs?.actor ?? null) === actor;

  const sample = useMemo(() => (demo ? demoAuditPage(category) : null), [demo, category]);
  const data = sample ?? (matches ? cached : undefined);

  if (data?.summary) {
    lastOverview.current = { workspaceId, summary: data.summary, retention: data.retention };
  }
  const overview = lastOverview.current?.workspaceId === workspaceId ? lastOverview.current : null;

  const setCategory = (next: WorkspaceAuditCategory | null) => {
    setCursor(null);
    setCategoryState(next);
  };
  const setActor = (next: string | null) => {
    setCursor(null);
    setActorState(next);
  };
  const clearFilters = () => {
    setCursor(null);
    setCategoryState(null);
    setActorState(null);
  };
  const loadMore = () => {
    if (data?.nextCursor) setCursor(data.nextCursor);
  };
  const reload = () => {
    if (cursor) setCursor(null);
    else void refetch();
  };

  return {
    data,
    overview,
    loading: !data && !isError && enabled,
    refreshing: isFetching && !cursor,
    loadingMore: Boolean(cursor) && isFetching,
    failed: !sample && !data && isError,
    category,
    actor,
    setCategory,
    setActor,
    clearFilters,
    loadMore,
    reload,
  };
}
