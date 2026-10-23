import { useTranslation } from "react-i18next";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";
import type { Workspace } from "@/shared/types";
import { WorkspaceIcon } from "./WorkspaceIcon";
import classes from "./WorkspacePicker.module.css";

export function PickerHandoff({ workspace }: { workspace: Workspace }) {
  const { t } = useTranslation();

  return (
    <div className={classes.handoff}>
      <span className={classes.handoffIcon}>
        <WorkspaceIcon icon={workspace.icon} />
      </span>
      <SwitchVisual inline label={t("workspaces.picker.opening", { name: workspace.name })} />
    </div>
  );
}
