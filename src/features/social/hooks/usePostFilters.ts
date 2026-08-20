import { useMemo, useState } from "react";
import { stageOf } from "../postStatus";
import type { ScheduledPost } from "@/shared/types";



export const FILTERS = [
  { value: "queue", label: "Queue" },
  { value: "failed", label: "Failed" },
  { value: "draft", label: "Drafts" },
  { value: "sent", label: "Sent" },
] as const;

export type Filter = (typeof FILTERS)[number]["value"];

export function matches(post: ScheduledPost, filter: Filter): boolean {
  const stage = stageOf(post);
  if (filter === "draft") return stage === "draft";
  if (filter === "failed") return stage === "failed";
  // Published history is fetched separately, so nothing from the schedule
  // collection belongs on that shelf.
  if (filter === "sent") return false;
  // Queue is what is still due to go out, and nothing else. A post that has
  // already published is history and a post that failed has its own shelf —
  // both sat here once, and both made the one list someone checks for "what is
  // coming" answer a question they did not ask.
  return stage === "scheduled";
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
