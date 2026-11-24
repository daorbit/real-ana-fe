import type { SearchFilter } from "@/shared/types";

export function filterParam(filters?: SearchFilter[]): { filters?: string } {
  return filters?.length ? { filters: JSON.stringify(filters) } : {};
}
