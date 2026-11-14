import { UserRound } from "lucide-react";
import classes from "./shared.module.css";

export function BioAvatar({ url, size = "md" }: { url: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={classes.avatar} data-size={size} aria-hidden>
      {url ? <img src={url} alt="" className={classes.avatarImage} /> : <UserRound size={size === "sm" ? 18 : 30} strokeWidth={1.6} />}
    </span>
  );
}
