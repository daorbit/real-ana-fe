import { QUANTALOG_MARK_LARGE, useWorkspaceLogo } from "@/features/workspace/hooks/useWorkspaceLogo";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import classes from "./WorkspacePicker.module.css";

export function WorkspaceIcon({ icon, size }: { icon?: WorkspaceIconData | null; size?: "sm" }) {
  const { src, onError } = useWorkspaceLogo(icon, QUANTALOG_MARK_LARGE);

  return (
    <span className={classes.iconWell} data-image data-size={size}>
      <img src={src} alt="" className={classes.iconImage} referrerPolicy="no-referrer" onError={onError} />
    </span>
  );
}
