import { useTranslation } from "react-i18next";
import type { KeyStatus } from "../../developers";
import classes from "./Developers.module.css";

const LABEL_KEY: Record<KeyStatus, string> = {
  active: "developers.statusActive",
  expiring: "developers.statusExpiring",
  expired: "developers.statusExpired",
};

export function KeyStatusBadge({ status }: { status: KeyStatus }) {
  const { t } = useTranslation();
  return (
    <span className={classes.status} data-status={status}>
      <span className={classes.statusDot} />
      {t(LABEL_KEY[status])}
    </span>
  );
}
