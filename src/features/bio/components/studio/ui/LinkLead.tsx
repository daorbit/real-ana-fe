import { linkIcon } from "@/features/bio/lib/linkIcon";
import { ServiceLogo } from "../../ServiceLogo";
import { IconTile } from "./IconTile";

export function LinkLead({ label, url, size = "md" }: { label: string; url: string; size?: "sm" | "md" }) {
  const match = linkIcon(label, url);
  if ("service" in match) return <ServiceLogo service={match.service} size={size} />;
  return <IconTile icon={match.icon} tone={match.tone} size={size} />;
}
