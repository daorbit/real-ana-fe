import { Building2 } from "lucide-react";
import { useWorkspaceLogo } from "@/features/workspace/hooks/useWorkspaceLogo";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import classes from "./WorkspacePicker.module.css";

export function WorkspaceIcon({ icon, size }: { icon?: WorkspaceIconData | null; size?: "sm" }) {
  const { src, onError } = useWorkspaceLogo(icon);

  if (!src) {
    return (
      <span className={classes.iconWell} data-size={size}>
        <Building2 size={36} strokeWidth={1.6} aria-hidden />
      </span>
    );
  }

  return (
    <span className={classes.iconWell} data-image data-size={size}>
      <img src={src} alt="" className={classes.iconImage} referrerPolicy="no-referrer" onError={onError} />
    </span>
  );
}
