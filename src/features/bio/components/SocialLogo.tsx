import type { BioSocialNetwork } from "@/features/bio/types";
import classes from "./ServiceLogo.module.css";

export function SocialLogo({ network, size = "sm" }: { network: BioSocialNetwork; size?: "sm" | "md" | "lg" }) {
  return <img src={`/services/${network}.svg`} alt="" aria-hidden className={classes.logo} data-size={size} />;
}
