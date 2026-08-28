import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

/**
 * A thin bar across the top of the viewport whenever a background refetch is
 * in flight while data is already on screen.
 *
 * The full-page skeletons only cover a first load. A stale-while-revalidate
 * refresh — a poll, a tag invalidation, a manual Refresh — otherwise gives no
 * sign anything is happening, so a number that is about to change looks static.
 * This is the smallest possible signal: no layout shift, gone the instant the
 * last request settles.
 */
export function FetchProgress() {
  const busy = useSelector((state: RootState) => {
    const queries = state.api.queries;
    for (const key in queries) {
      if (queries[key]?.status === "pending") return true;
    }
    return false;
  });

  if (!busy) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        insetInline: 0,
        top: 0,
        height: 2,
        zIndex: 350,
        background: "var(--accent, var(--mantine-color-emerald-5))",
        animation: "fetch-progress 1.1s ease-in-out infinite",
        transformOrigin: "left",
      }}
    />
  );
}
