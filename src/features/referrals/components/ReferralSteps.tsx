import { useTranslation } from "react-i18next";
import type { ReferralQualifyOn } from "@/shared/types";
import classes from "./Referrals.module.css";

export function ReferralSteps({
  qualifyOn,
  percent,
  days,
}: {
  qualifyOn?: ReferralQualifyOn;
  percent: number;
  days: number;
}) {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("referrals.step1Title", "Share your link"),
      body: t("referrals.step1Body", "Send it to a friend, client or teammate."),
    },
    qualifyOn === "first_payment"
      ? {
          title: t("referrals.step2PaymentTitle", "They make a purchase"),
          body: t("referrals.step2PaymentBody", "They sign up and buy their first plan or addon."),
        }
      : {
          title: t("referrals.step2SignupTitle", "They sign up"),
          body: t("referrals.step2SignupBody", "They create a Quantalog account from your link."),
        },
    {
      title: t("referrals.step3Title", "You get {{percent}}% off", { percent }),
      body: t("referrals.step3Body", "A single-use coupon for your next purchase, valid for {{days}} days.", { days }),
    },
  ];

  return (
    <aside className={classes.how}>
      <span className={classes.fieldLabel}>{t("referrals.howItWorks", "How it works")}</span>
      <ol className={classes.timeline}>
        {steps.map((step, i) => (
          <li key={step.title} className={classes.timelineItem}>
            <span className={classes.timelineDot}>{i + 1}</span>
            <div>
              <p className={classes.timelineTitle}>{step.title}</p>
              <p className={classes.timelineBody}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
