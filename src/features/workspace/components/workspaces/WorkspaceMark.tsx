import { Folder } from "lucide-react";
import classes from "./Workspaces.module.css";

export function WorkspaceMark({ color, size = "sm" }: { color?: string; size?: "sm" | "lg" }) {
  return (
    <span
      aria-hidden
      className={`${classes.mark} ${size === "lg" ? classes.markLg : classes.markSm}`}
      style={color ? { ["--mark" as string]: color } : undefined}
    >
      <Folder size={size === "lg" ? 22 : 15} strokeWidth={2} />
    </span>
  );
}
