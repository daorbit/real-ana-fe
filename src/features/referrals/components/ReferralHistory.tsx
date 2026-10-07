import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { shortDate } from "@/shared/lib";
import type { MyReferralRow, ReferralQualifyOn } from "@/shared/types";
import classes from "./Referrals.module.css";

const STATUS_COLOR: Record<MyReferralRow["status"], string> = {
  pending: "yellow",
  rewarded: "teal",
  closed: "gray",
};

export function ReferralHistory({ rows, qualifyOn }: { rows: MyReferralRow[]; qualifyOn?: ReferralQualifyOn }) {
  const { t } = useTranslation();

  const status = (r: MyReferralRow) => {
    if (r.status === "rewarded")
      return {
        label: t("referrals.statusRewarded", "Rewarded"),
        hint: t("referrals.hintRewarded", "Earned you a {{percent}}% coupon", { percent: r.coupon?.percentOff ?? "" }),
      };
    if (r.status === "pending")
      return qualifyOn === "first_payment"
        ? {
            label: t("referrals.statusPending", "Pending"),
            hint: t("referrals.hintPendingPayment", "Rewarded after their first purchase"),
          }
        : {
            label: t("referrals.statusReview", "In review"),
            hint: t("referrals.hintPendingReview", "We are checking this signup"),
          };
    return {
      label: t("referrals.statusClosed", "Not eligible"),
      hint: t("referrals.hintClosed", "This signup did not qualify"),
    };
  };

  return (
    <section>
      <div className={classes.sectionHead}>
        <h4 className={classes.sectionTitle}>{t("referrals.history", "People you invited")}</h4>
      </div>

      {!rows.length ? (
        <EmptyState
          compact
          icon={Users}
          title={t("referrals.emptyTitle", "No referrals yet")}
          description={t("referrals.emptyBody", "People who sign up with your link will show up here.")}
        />
      ) : (
        <ul className={classes.people}>
          {rows.map((r) => {
            const s = status(r);
            return (
              <li key={r.id} className={classes.person}>
                <span className={classes.avatar} aria-hidden>{r.name.charAt(0).toUpperCase()}</span>
                <div className={classes.personMain}>
                  <span className={classes.personName}>{r.name}</span>
                  <span className={classes.personMeta}>
                    {t("referrals.joinedOn", "Joined {{date}}", { date: shortDate(r.createdAt) })}
                  </span>
                </div>
                <div className={classes.personStatus}>
                  <Badge size="sm" variant="light" color={STATUS_COLOR[r.status]}>{s.label}</Badge>
                  <span className={classes.personMeta}>{s.hint}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
