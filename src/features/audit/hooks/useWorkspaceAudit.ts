import { useMemo, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWorkspaceAuditQuery } from "@/app/store";
import { demoAuditPage } from "@/features/demo/demoAudit";
import type { AuditSummary, WorkspaceAuditPage } from "@/shared/types";
import type { WorkspaceAuditCategory } from "../lib/categories";

const REFRESH_AFTER_S = 30;
const AUDIT_PAGE_SIZE = 10;

type Overview = { workspaceId: string | null; summary: AuditSummary; retention: WorkspaceAuditPage["retention"] };

export function useWorkspaceAudit(workspaceId: string | null, { demo, enabled }: { demo: boolean; enabled: boolean }) {
  const [category, setCategoryState] = useState<WorkspaceAuditCategory | null>(null);
  const [actor, setActorState] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const lastOverview = useRef<Overview | null>(null);

  const { data: cached, originalArgs, isFetching, isError, refetch } = useGetWorkspaceAuditQuery(
    enabled && !demo && workspaceId ? { workspaceId, category, actor, page, limit: AUDIT_PAGE_SIZE } : skipToken,
    { refetchOnMountOrArgChange: REFRESH_AFTER_S },
  );
  const matches =
    originalArgs?.workspaceId === workspaceId &&
    (originalArgs?.category ?? null) === category &&
    (originalArgs?.actor ?? null) === actor;
  const onPage = matches && originalArgs?.page === page;

  const sample = useMemo(() => (demo ? demoAuditPage(category) : null), [demo, category]);
  const data = sample ?? (matches ? cached : undefined);

  if (data?.summary) {
    lastOverview.current = { workspaceId, summary: data.summary, retention: data.retention };
  }
  const overview = lastOverview.current?.workspaceId === workspaceId ? lastOverview.current : null;

  const setCategory = (next: WorkspaceAuditCategory | null) => {
    setPage(1);
    setCategoryState(next);
  };
  const setActor = (next: string | null) => {
    setPage(1);
    setActorState(next);
  };
  const clearFilters = () => {
    setPage(1);
    setCategoryState(null);
    setActorState(null);
  };
  const goToPage = (next: number) => {
    const last = data?.pagination?.pages ?? 1;
    setPage(Math.min(Math.max(1, next), last));
  };
  const reload = () => {
    if (page > 1) setPage(1);
    else void refetch();
  };

  return {
    data,
    overview,
    page,
    pagination: sample ? undefined : data?.pagination,
    paging: isFetching && !onPage,
    loading: !data && !isError && enabled,
    refreshing: isFetching && onPage,
    failed: !sample && !data && isError,
    category,
    actor,
    setCategory,
    setActor,
    clearFilters,
    goToPage,
    reload,
  };
}
