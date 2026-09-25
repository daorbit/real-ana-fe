import { workspaceInitial } from "@/features/workspace/workspaceMarks";
import classes from "./Workspaces.module.css";

/**
 * A workspace's logo tile: its first letter, in the page's own neutral
 * colours. Plain on purpose — a colour per workspace read as decoration.
 */
export function WorkspaceMark({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  return (
    <span aria-hidden className={classes.mark} data-size={size}>
      {workspaceInitial(name)}
    </span>
  );
}
