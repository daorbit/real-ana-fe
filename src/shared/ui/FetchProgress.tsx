import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useSettledFlag } from "@/shared/hooks/useSettledFlag";
import classes from "./FetchProgress.module.css";

const BACKGROUND_ENDPOINTS = new Set([
  "getNotificationCount",
  "getLive",
  "getStats",
  "getSites",
  "getTargets",
]);

function selectRefreshing(state: RootState): boolean {
  const queries = state.api.queries;
  for (const key in queries) {
    const query = queries[key];
    if (!query || query.status !== "pending") continue;
    if (query.data === undefined) continue;
    if (BACKGROUND_ENDPOINTS.has(query.endpointName ?? "")) continue;
    return true;
  }
  return false;
}

export function FetchProgress() {
  const refreshing = useSelector(selectRefreshing);
  const visible = useSettledFlag(refreshing);

  return <div aria-hidden className={classes.bar} data-visible={visible || undefined} />;
}
