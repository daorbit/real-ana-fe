import { Globe } from "lucide-react";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

export function SetupOrb({ site }: { site: Site | null }) {
  return (
    <div className={classes.orb} aria-hidden>
      <span className={classes.ring} />
      <span className={`${classes.ring} ${classes.ringLate}`} />
      <span className={classes.core}>
        {site ? <SiteFavicon domain={site.domain} framework={site.framework} size={30} /> : <Globe size={28} />}
      </span>
    </div>
  );
}
