import { useMemo } from "react";
import { useDemo } from "@/features/demo/context";
import type { WorkspaceAppId } from "@/shared/types";
import { useWorkspace } from "./context";

export type EnabledApps = Record<WorkspaceAppId, boolean>;

export function useWorkspaceApps(): EnabledApps {
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const compare = demo || Boolean(active?.apps?.compare?.enabled);
  return useMemo(() => ({ compare }), [compare]);
}
