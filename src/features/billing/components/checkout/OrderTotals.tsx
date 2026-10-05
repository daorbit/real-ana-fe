import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import { MIN_CHARGE } from "../../lib/constants";
import { SummaryLine } from "./SummaryLine";
import classes from "./Checkout.module.css";

export type OrderLine = { key: string; label: string; value: number };

export function OrderTotals({
  lines,
  subtotal,
  total,
  chargeable,
  percentOff,
  couponCode,
  money,
}: {
  lines: OrderLine[];
  subtotal: number;
  total: number;
  chargeable: number;
  percentOff: number;
  couponCode?: string;
  money: (amountMinor: number) => string;
}) {
  const { t } = useTranslation();
  const hasLines = lines.length > 0 || percentOff > 0;

  return (
    <>
      {hasLines && (
        <>
          <div className={classes.lines}>
            {lines.map((line) => (
              <SummaryLine key={line.key} label={line.label} value={money(line.value)} />
            ))}
            {percentOff > 0 && (
              <>
                {lines.length > 0 && <div className={classes.rule} />}
                <SummaryLine label={t("billing.subtotal")} value={money(subtotal)} />
                <SummaryLine
                  tone="discount"
                  label={
                    <>
                      <Tag size={12} />
                      {t("billing.couponOff", { code: couponCode, percent: percentOff })}
                    </>
                  }
                  value={`− ${money(subtotal - total)}`}
                />
              </>
            )}
          </div>

          <div className={classes.rule} />
        </>
      )}

      <div className={classes.total}>
        <span className={classes.totalLabel}>{t("billing.total")}</span>
        <span className={classes.totalValue}>{money(chargeable)}</span>
      </div>

      {chargeable > total && (
        <p className={classes.hint}>{t("billing.minimumCharge", { amount: money(MIN_CHARGE) })}</p>
      )}
    </>
  );
}
