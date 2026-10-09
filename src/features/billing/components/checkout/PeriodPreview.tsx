import { Skeleton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CalendarCheck } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetCheckoutPreviewQuery } from "@/app/store";
import { longDate } from "@/shared/lib";
import type { BillingCycle, Plan } from "@/shared/types";
import s from "./CheckoutPage.module.css";

export function PeriodPreview({
  workspaceId,
  plan,
  cycle,
}: {
  workspaceId: string | null;
  plan: Plan;
  cycle: BillingCycle;
}) {
  const { t } = useTranslation();
  const { currentData: preview, isFetching } = useGetCheckoutPreviewQuery(
    workspaceId ? { workspaceId, planSlug: plan.slug, cycle } : skipToken,
  );

  const length = cycle === "yearly" ? t("billing.twelveMonths", "12 months") : t("billing.oneMonth", "1 month");

  return (
    <div className={s.period} aria-live="polite">
      <CalendarCheck size={16} className={s.periodIcon} />
      <div className={s.periodBody}>
        <span className={s.periodTitle}>
          {t("billing.periodWhat", "{{plan}} · {{length}}", { plan: plan.name, length })}
        </span>
        {isFetching || !preview ? (
          <Skeleton height={10} width="70%" mt={6} radius="sm" />
        ) : (
          <>
            <span className={s.periodLine}>
              {t("billing.periodUntil", "Active until {{date}}", { date: longDate(preview.periodEnd) })}
            </span>
            {preview.carriedDays > 0 && (
              <span className={s.periodNote}>
                {t("billing.periodCarried", "Includes {{count}} unused days from your current plan", {
                  count: preview.carriedDays,
                })}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
