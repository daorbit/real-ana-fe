import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

export function SetupAddressBar({ site }: { site: Site | null }) {
  const { t } = useTranslation();

  return (
    <div className={classes.chrome} aria-hidden>
      <span className={classes.dots}>
        <span />
        <span />
        <span />
      </span>
      <div className={classes.address} data-waiting={site ? true : undefined}>
        {site ? (
          <SiteFavicon domain={site.domain} framework={site.framework} logoUrl={site.logoUrl} size={14} />
        ) : (
          <Lock size={12} className={classes.addressLock} />
        )}
        <span className={classes.addressText}>
          {site ? site.domain || site.name : t("setup.domainPlaceholder", "yourwebsite.com")}
          {!site && <span className={classes.addressCaret} />}
        </span>
      </div>
      {site ? (
        <span className={classes.addressState}>
          <span className={classes.statusDot} />
          {t("setup.eyebrowWaiting", "Waiting for data")}
        </span>
      ) : (
        <span className={classes.chromeSpacer} />
      )}
    </div>
  );
}
