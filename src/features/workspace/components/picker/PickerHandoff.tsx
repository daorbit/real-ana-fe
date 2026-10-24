import { useTranslation } from "react-i18next";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";
import type { Workspace } from "@/shared/types";
import { WorkspaceIcon } from "./WorkspaceIcon";
import classes from "./WorkspacePicker.module.css";

export function PickerHandoff({ workspace }: { workspace: Workspace }) {
  const { t } = useTranslation();

  return (
    <div className={classes.handoff}>
      <SwitchVisual
        inline
        name={workspace.name}
        mark={
          <span className={classes.handoffMark}>
            <WorkspaceIcon icon={workspace.icon} />
          </span>
        }
        label={t("workspaces.picker.openingWorkspace")}
      />
    </div>
  );
}
