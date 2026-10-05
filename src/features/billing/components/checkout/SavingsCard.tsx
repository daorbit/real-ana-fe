import { useTranslation } from "react-i18next";
import { BadgePercent } from "lucide-react";
import s from "./CheckoutPage.module.css";

export type SavingLine = { key: string; label: string; amount: number };

export function SavingsCard({ lines, money }: { lines: SavingLine[]; money: (amountMinor: number) => string }) {
  const { t } = useTranslation();
  const visible = lines.filter((l) => l.amount > 0);
  if (!visible.length) return null;
  const total = visible.reduce((sum, l) => sum + l.amount, 0);

  return (
    <>
      <div className={s.saving}>
        <span className={s.savingLabel}>
          <BadgePercent size={16} />
          {t("billing.youSave", "You save")}
        </span>
        <span className={s.savingValue}>{money(total)}</span>
      </div>
      {visible.length > 1 && (
        <div className={s.savingBreak}>
          {visible.map((l) => (
            <div key={l.key} className={s.savingLine}>
              <span>{l.label}</span>
              <span>− {money(l.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
