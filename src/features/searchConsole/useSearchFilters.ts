import { useMemo, useState } from "react";
import type { SearchFilter, SearchType } from "@/shared/types";
import { addFilter, fieldAllowed } from "./searchFilters";

const NONE: SearchFilter[] = [];

export type SearchFiltersState = ReturnType<typeof useSearchFilters>;

export function useSearchFilters(type: SearchType) {
  const [all, setAll] = useState<SearchFilter[]>(NONE);
  const filters = useMemo(() => all.filter((f) => fieldAllowed(f.dimension, type)), [all, type]);

  return {
    filters,
    request: filters.length ? filters : undefined,
    add: (next: SearchFilter) => setAll((current) => addFilter(current, next)),
    remove: (target: SearchFilter) => setAll((current) => current.filter((f) => f !== target)),
    clear: () => setAll(NONE),
  };
}
