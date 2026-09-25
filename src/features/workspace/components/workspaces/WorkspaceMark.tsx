import type { CSSProperties } from "react";
import { workspaceHue, workspaceInitial } from "@/features/workspace/workspaceMarks";
import classes from "./Workspaces.module.css";

/**
 * A workspace's logo tile: its first letter on a gradient in the workspace's
 * own hue, so each workspace is recognisable at a glance.
 */
export function WorkspaceMark({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={classes.mark}
      data-size={size}
      style={{ "--hue": workspaceHue(name) } as CSSProperties}
    >
      {workspaceInitial(name)}
    </span>
  );
}
