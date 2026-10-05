import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp } from "lucide-react";
import { num } from "@/shared/lib";
import type { Plan } from "@/shared/types";
import s from "./CheckoutPage.module.css";

export function PlanChanges({ from, to }: { from: Plan; to: Plan }) {
  const { t } = useTranslation();

  const rows = [
    { key: "audits", label: t("billing.rowAudits", "SEO audits / month"), from: from.monthlyAuditQuota, to: to.monthlyAuditQuota },
    { key: "crawls", label: t("billing.rowCrawls", "Site crawls / month"), from: from.monthlyCrawlQuota, to: to.monthlyCrawlQuota },
    { key: "recipients", label: t("billing.rowRecipients", "Report recipients"), from: from.maxReportRecipients, to: to.maxReportRecipients },
  ];

  return (
    <div className={s.stats}>
      {rows.map((row) => {
        const diff = row.to - row.from;
        const tone = diff > 0 ? "up" : diff < 0 ? "down" : undefined;
        const Arrow = diff > 0 ? ArrowUp : ArrowDown;
        return (
          <div key={row.key} className={s.stat}>
            <span className={s.statLabel}>{row.label}</span>
            <span className={s.statValue}>{num(row.to)}</span>
            <span className={s.statDelta} data-tone={tone}>
              {diff === 0 ? (
                t("billing.sameAs", "Same as {{plan}}", { plan: from.name })
              ) : (
                <>
                  <Arrow size={12} strokeWidth={2.5} />
                  {t("billing.fromValue", "{{n}} from {{value}}", { n: num(Math.abs(diff)), value: num(row.from) })}
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
