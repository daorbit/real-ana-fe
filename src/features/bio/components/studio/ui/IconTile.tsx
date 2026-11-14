import type { LucideIcon } from "lucide-react";
import type { TileTone } from "@/features/bio/lib/linkIcon";
import classes from "./IconTile.module.css";

export function IconTile({ icon: Icon, tone, size = "md" }: { icon: LucideIcon; tone: TileTone; size?: "sm" | "md" }) {
  return (
    <span className={classes.tile} data-tone={tone} data-size={size} aria-hidden>
      <Icon size={size === "sm" ? 14 : 17} strokeWidth={2.1} />
    </span>
  );
}
