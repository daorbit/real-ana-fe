import type { Workspace } from "@/shared/types";

export function lastUsedFirst(workspaces: Workspace[], lastId: string | null): Workspace[] {
  if (!lastId) return workspaces;
  const last = workspaces.find((w) => w._id === lastId);
  if (!last) return workspaces;
  return [last, ...workspaces.filter((w) => w._id !== lastId)];
}
