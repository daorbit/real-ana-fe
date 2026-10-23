import { Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import type { BillingCycle } from "@/shared/types";
import classes from "./Checkout.module.css";

export function AutoRenewToggle({
  checked,
  cycle,
  busy,
  onChange,
}: {
  checked: boolean;
  cycle: BillingCycle;
  busy: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { t } = useTranslation();
  const description = checked
    ? cycle === "yearly"
      ? t("billing.autoRenewOnYear", "Charged every year until you cancel")
      : t("billing.autoRenewOnMonth", "Charged every month until you cancel")
    : t("billing.autoRenewOff", "Pay once and renew by hand");

  return (
    <div className={classes.optionRow}>
      <span className={classes.optionIcon}>
        <RefreshCw size={14} />
      </span>
      <span className={classes.optionText}>
        <span className={classes.optionTitle}>{t("billing.autoRenewTitle", "Renew automatically")}</span>
        <span className={classes.optionDesc}>{description}</span>
      </span>
      <Switch
        size="md"
        checked={checked}
        disabled={busy}
        onChange={(event) => onChange(event.currentTarget.checked)}
        aria-label={t("billing.autoRenewTitle", "Renew automatically")}
      />
    </div>
  );
}
