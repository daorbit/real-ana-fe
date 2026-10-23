import { useState } from "react";
import { FolderKanban } from "lucide-react";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import classes from "./WorkspacePicker.module.css";

export function WorkspaceIcon({ icon }: { icon?: WorkspaceIconData | null }) {
  const [failed, setFailed] = useState(false);
  const src = icon?.logoUrl;

  if (!src || failed) {
    return (
      <span className={classes.iconWell}>
        <FolderKanban size={30} strokeWidth={1.6} />
      </span>
    );
  }

  return (
    <span className={classes.iconWell} data-image>
      <img
        src={src}
        alt=""
        className={classes.iconImage}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
