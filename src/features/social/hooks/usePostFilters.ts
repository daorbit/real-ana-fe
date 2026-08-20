import { useMemo, useState } from "react";
import { stageOf } from "../postStatus";
import type { ScheduledPost } from "@/shared/types";


/**
 * The shelves, named for what is on them rather than for the field they filter.
 *
 * "Queue" is everything still due to go out — scheduled, repeating and the ones
 * that failed on the way — because that is one question ("what is coming?"),
 * and splitting it across three tabs made people check three places to answer
 * it. Failures stay in the queue precisely because they still need attention.
 *
 * There is no "Sent" shelf here. Published history is its own view, fed by its
 * own endpoint, and reached from the view switch in the page header. A second
 * Sent tab beside it listed only the published posts that happen to still sit
 * in the *schedule* collection — a near-always-empty subset of the same idea,
 * under the same word, two controls apart.
 */
export const FILTERS = [
  { value: "queue", label: "Queue" },
  { value: "draft", label: "Drafts" },
] as const;

export type Filter = (typeof FILTERS)[number]["value"];

export function matches(post: ScheduledPost, filter: Filter): boolean {
  const stage = stageOf(post);
  if (filter === "draft") return stage === "draft";
  // Published posts still on a schedule stay in the queue: `PostQueue` gives
  // them their own dimmed "Published" section beneath the upcoming days, which
  // is where a repeat's history belongs — next to its next run.
  return stage !== "draft";
}


export function usePostFilters(posts: ScheduledPost[]) {
  const [filter, setFilter] = useState<Filter>("queue");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const out = {} as Record<Filter, number>;
    for (const f of FILTERS) out[f.value] = posts.filter((p) => matches(p, f.value)).length;
    return out;
  }, [posts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) => matches(p, filter)
        && (!q || p.name.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q)),
    );
  }, [posts, filter, query]);

  return { filter, setFilter, query, setQuery, counts, visible };
}
