import { useTranslation } from "react-i18next";
import classes from "./Install.module.css";

export function InstallStatusPill({ live }: { live: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={classes.statusPill} data-live={live || undefined}>
      <span className={classes.statusDot} />
      {live ? t("install.live", "Receiving data") : t("install.waiting", "Waiting for the first pageview")}
    </span>
  );
}
