import { workspaceInitials } from "@/features/workspace/workspaceMarks";
import classes from "./Workspaces.module.css";

const SIZE = { sm: classes.markSm, md: classes.markMd, lg: classes.markLg };

/**
 * A workspace's monogram: its initials on a tile in the workspace's colour.
 * Initials tell five workspaces apart at a glance; five identical folder
 * icons in different tints did not.
 */
export function WorkspaceMark({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color?: string;
  size?: keyof typeof SIZE;
}) {
  return (
    <span
      aria-hidden
      className={`${classes.mark} ${SIZE[size]}`}
      style={color ? { ["--mark" as string]: color } : undefined}
    >
      {workspaceInitials(name)}
    </span>
  );
}
