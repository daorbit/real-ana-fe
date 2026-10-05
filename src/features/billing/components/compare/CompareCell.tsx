import { Check, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Compare.module.css";

export function CompareCell({ value }: { value: string | boolean }) {
  const { t } = useTranslation();

  if (typeof value === "string") return <span className={classes.value}>{value}</span>;

  return value ? (
    <span className={classes.yes}>
      <Check size={12} strokeWidth={3.2} aria-hidden />
      <span className={classes.srOnly}>{t("billing.compareIncluded", "Included")}</span>
    </span>
  ) : (
    <span className={classes.no}>
      <Minus size={14} strokeWidth={2.2} aria-hidden />
      <span className={classes.srOnly}>{t("billing.compareNotIncluded", "Not included")}</span>
    </span>
  );
}
