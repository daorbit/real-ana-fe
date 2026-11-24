import { Skeleton } from "@mantine/core";
import classes from "./skeleton.module.css";

const RADIUS = { line: 6, block: 8, tile: 4, pill: 7, circle: "xl" } as const;

export function Bone({
  w = "100%",
  h = 10,
  shape = "line",
  strong = false,
  className,
}: {
  w?: number | string;
  h?: number | string;
  shape?: "line" | "block" | "pill" | "circle" | "tile";
  strong?: boolean;
  className?: string;
}) {
  return (
    <Skeleton
      width={w}
      height={h}
      radius={RADIUS[shape]}
      className={`${classes.bone} ${className ?? ""}`}
      data-strong={strong || undefined}
      aria-hidden
    />
  );
}
