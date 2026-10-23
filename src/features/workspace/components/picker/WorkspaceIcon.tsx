import { useMemo, useState } from "react";
import { FolderKanban } from "lucide-react";
import { faviconForHost } from "@/shared/lib/favicon";
import type { WorkspaceIcon as WorkspaceIconData } from "@/shared/types";
import classes from "./WorkspacePicker.module.css";

export function WorkspaceIcon({ icon }: { icon?: WorkspaceIconData | null }) {
  const sources = useMemo(
    () =>
      [icon?.logoUrl, icon?.domain ? faviconForHost(icon.domain) : null].filter(
        (s): s is string => Boolean(s),
      ),
    [icon?.logoUrl, icon?.domain],
  );
  const [failed, setFailed] = useState(0);
  const src = sources[failed];

  if (!src) {
    return (
      <span className={classes.iconWell}>
        <FolderKanban size={30} strokeWidth={1.6} />
      </span>
    );
  }

  return (
    <span className={classes.iconWell} data-image>
      <img
        key={src}
        src={src}
        alt=""
        className={classes.iconImage}
        referrerPolicy="no-referrer"
        onError={() => setFailed((n) => n + 1)}
      />
    </span>
  );
}
