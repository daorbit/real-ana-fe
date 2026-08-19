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
 */
export const FILTERS = [
  { value: "queue", label: "Queue" },
  { value: "draft", label: "Drafts" },
  { value: "sent", label: "Sent" },
] as const;

export type Filter = (typeof FILTERS)[number]["value"];

export function matches(post: ScheduledPost, filter: Filter): boolean {
  const stage = stageOf(post);
  if (filter === "draft") return stage === "draft";
  if (filter === "sent") return stage === "published";
  return stage !== "draft" && stage !== "published";
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
