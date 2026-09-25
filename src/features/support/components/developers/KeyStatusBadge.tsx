import { useTranslation } from "react-i18next";
import type { ApiKey } from "@/shared/types";
import { daysUntil, keyStatus } from "../../developers";
import classes from "./Developers.module.css";

export function KeyStatusBadge({ apiKey }: { apiKey: Pick<ApiKey, "expiresAt"> }) {
  const { t } = useTranslation();
  const status = keyStatus(apiKey);

  const label =
    status === "expired"
      ? t("developers.statusExpired")
      : status === "expiring" && apiKey.expiresAt
        ? t("developers.statusExpiresIn", { count: daysUntil(apiKey.expiresAt) })
        : t("developers.statusActive");

  return (
    <span className={classes.status} data-status={status}>
      <span className={classes.statusDot} />
      {label}
    </span>
  );
}
