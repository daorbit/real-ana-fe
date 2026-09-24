import classes from "./Workspaces.module.css";

export function WorkspaceMark({ src, size = "sm" }: { src?: string; size?: "sm" | "lg" }) {
  return (
    <span aria-hidden className={`${classes.mark} ${size === "lg" ? classes.markLg : classes.markSm}`}>
      {src && <img src={src} alt="" />}
    </span>
  );
}
