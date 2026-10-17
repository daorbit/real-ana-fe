import { useSetWorkspaceAppMutation } from "@/app/store";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import type { WorkspaceAppId } from "@/shared/types";
import { WORKSPACE_APP_INFO } from "../lib/quantalogApps";

export function useToggleWorkspaceApp(app: WorkspaceAppId) {
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const { demo } = useDemo();
  const apps = useWorkspaceApps();
  const [setApp, state] = useSetWorkspaceAppMutation();
  const info = WORKSPACE_APP_INFO[app];

  const toggle = async (enabled: boolean) => {
    if (!active) return false;
    try {
      await setApp({ workspaceId: active._id, app, enabled }).unwrap();
      notify.success(enabled ? `${info.name} is on. Find ${info.navLabel} ${info.location}.` : `${info.name} is off.`);
      return true;
    } catch (e) {
      notifyError(e, `Could not change ${info.name}.`);
      return false;
    }
  };

  return {
    enabled: apps[app],
    canManage: canAdmin && !demo,
    saving: state.isLoading,
    enabledAt: active?.apps?.[app]?.enabledAt,
    toggle,
  };
}
