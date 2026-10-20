import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

export function SetupAddressBar({ site }: { site: Site | null }) {
  const { t } = useTranslation();

  return (
    <div className={classes.address} data-waiting={site ? true : undefined} aria-hidden>
      {site ? (
        <SiteFavicon domain={site.domain} framework={site.framework} logoUrl={site.logoUrl} size={16} />
      ) : (
        <Lock size={13} className={classes.addressLock} />
      )}
      <span className={classes.addressText}>
        {site ? site.domain || site.name : t("setup.domainPlaceholder", "yourwebsite.com")}
        {!site && <span className={classes.addressCaret} />}
      </span>
      {site && (
        <span className={classes.addressState}>
          <span className={classes.statusDot} />
          {t("setup.eyebrowWaiting", "Waiting for data")}
        </span>
      )}
    </div>
  );
}
