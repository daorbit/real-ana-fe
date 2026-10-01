import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
import { creditType } from "../../lib/credits";
import classes from "./Checkout.module.css";

export function CreditsIncluded({ totals }: { totals: Record<string, number> }) {
  const { t } = useTranslation();
  const entries = Object.entries(totals);
  if (!entries.length) return null;

  return (
    <div className={classes.credits}>
      <p className={classes.creditsTitle}>{t("billing.creditsIncluded")}</p>
      {entries.map(([type, credits]) => (
        <div key={type} className={classes.creditLine}>
          <span>{creditType(t, type, credits)}</span>
          <span className={classes.creditValue}>+{num(credits)}</span>
        </div>
      ))}
    </div>
  );
}
