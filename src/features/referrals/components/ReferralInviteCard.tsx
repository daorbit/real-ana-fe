import { useTranslation } from "react-i18next";
import { Gift } from "lucide-react";
import type { MyReferrals } from "@/shared/types";
import { ReferralShareBox } from "./ReferralShareBox";
import { ReferralSteps } from "./ReferralSteps";
import classes from "./Referrals.module.css";

export function ReferralInviteCard({ data }: { data: MyReferrals }) {
  const { t } = useTranslation();
  const percent = data.rewardPercentOff ?? 0;
  const days = data.rewardValidDays ?? 0;

  return (
    <section className={classes.hero}>
      <div className={classes.heroMain}>
        <span className={classes.eyebrow}>
          <Gift size={14} />
          {t("billing.tabReferrals", "Refer & earn")}
        </span>
        <h3 className={classes.title}>
          {t("referrals.headline", "Invite a friend, get {{percent}}% off", { percent })}
        </h3>
        <p className={classes.lede}>
          {t(
            "referrals.lede",
            "Every person who joins through your link earns you a single-use discount coupon for your next plan or addon purchase.",
          )}
        </p>
        <ReferralShareBox code={data.code ?? ""} />
      </div>
      <ReferralSteps qualifyOn={data.qualifyOn} percent={percent} days={days} />
    </section>
  );
}
