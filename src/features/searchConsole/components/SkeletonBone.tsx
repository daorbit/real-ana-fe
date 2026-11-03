import { Skeleton } from "@mantine/core";

const RADIUS = { line: "sm", block: "md", tile: "sm", pill: "xl", circle: "xl" } as const;

export function Bone({
  w = "100%",
  h = 10,
  shape = "line",
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
      circle={shape === "circle" && w === h}
      className={`skeleton-shimmer ${className ?? ""}`}
      aria-hidden
    />
  );
}
