import { FolderClosed } from "lucide-react";
import classes from "./Workspaces.module.css";

const ICON = { sm: 15, md: 18, lg: 26 } as const;

/** A workspace's tile: a folder, in the page's own neutral colours. */
export function WorkspaceMark({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span aria-hidden className={classes.mark} data-size={size}>
      <FolderClosed size={ICON[size]} strokeWidth={1.8} />
    </span>
  );
}
