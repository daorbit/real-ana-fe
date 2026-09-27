import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchType } from "@/shared/types";

export function searchPageHref(params: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  url: string;
}) {
  const query = new URLSearchParams({
    workspaceId: params.workspaceId,
    siteId: params.siteId,
    days: String(params.days),
    type: params.type,
    url: params.url,
  });
  return `/app/search-visibility/page/detail?${query.toString()}`;
}

export function useOpenSearchPage(workspaceId: string, siteId: string, days: number, type: SearchType) {
  const navigate = useNavigate();
  return useCallback(
    (url: string) => navigate(searchPageHref({ workspaceId, siteId, days, type, url })),
    [navigate, workspaceId, siteId, days, type],
  );
}
