import { linkIcon } from "@/features/bio/lib/linkIcon";
import { ServiceLogo } from "../ServiceLogo";
import classes from "./shared.module.css";

export function LinkIcon({ label, url, size = 18 }: { label: string; url: string; size?: number }) {
  const match = linkIcon(label, url);
  if ("service" in match) return <ServiceLogo service={match.service} size="sm" />;
  const Icon = match.icon;
  return (
    <span className={classes.iconTile} aria-hidden>
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}
