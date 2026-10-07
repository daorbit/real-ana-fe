import { useTranslation } from "react-i18next";
import { Ticket } from "lucide-react";
import type { MyRewardCoupon } from "@/shared/types";
import { RewardCouponTicket } from "./RewardCouponTicket";
import classes from "./RewardWallet.module.css";
import shared from "./Referrals.module.css";

export function RewardWallet({ coupons }: { coupons: MyRewardCoupon[] }) {
  const { t } = useTranslation();

  return (
    <section>
      <div className={shared.sectionHead}>
        <h4 className={shared.sectionTitle}>{t("referrals.walletTitle", "Your rewards")}</h4>
        <p className={shared.sectionHint}>
          {t("referrals.walletHint", "Enter a coupon code at checkout on the Plans or Add-ons tab. Each code works once, on your account only.")}
        </p>
      </div>

      {coupons.length ? (
        <div className={classes.grid}>
          {coupons.map((c) => (
            <RewardCouponTicket key={c.code} coupon={c} />
          ))}
        </div>
      ) : (
        <div className={classes.placeholder}>
          <Ticket size={18} />
          <span>{t("referrals.walletEmpty", "Your first coupon lands here as soon as someone joins with your link.")}</span>
        </div>
      )}
    </section>
  );
}
