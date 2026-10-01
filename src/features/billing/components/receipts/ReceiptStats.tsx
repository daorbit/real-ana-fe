import { useTranslation } from "react-i18next";
import { formatMoney } from "@/shared/lib/currency";
import type { Currency, Invoice } from "@/shared/types";
import classes from "./Receipts.module.css";

function totalsByCurrency(invoices: Invoice[]): string {
  const totals = new Map<Currency, number>();
  for (const inv of invoices) totals.set(inv.currency, (totals.get(inv.currency) ?? 0) + inv.amount);
  return [...totals].map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
}

export function ReceiptStats({ invoices }: { invoices: Invoice[] }) {
  const { t } = useTranslation();
  const latest = invoices.reduce((a, b) => (new Date(b.issuedAt) > new Date(a.issuedAt) ? b : a));

  const stats = [
    { label: t("billing.statTotalPaid", "Total paid"), value: totalsByCurrency(invoices) },
    { label: t("billing.statPayments", "Payments"), value: String(invoices.length) },
    {
      label: t("billing.statLastPayment", "Last payment"),
      value: new Date(latest.issuedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    },
  ];

  return (
    <div className={classes.stats}>
      {stats.map((s) => (
        <div key={s.label} className={classes.stat}>
          <div className={classes.statLabel}>{s.label}</div>
          <div className={classes.statValue}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}
