import { ActionIcon, Badge, Button, CopyButton, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy } from "lucide-react";
import { shortDate } from "@/shared/lib";
import type { MyRewardCoupon } from "@/shared/types";
import { COUPON_STATE_COLOR, daysLeft } from "../lib/rewards";
import classes from "./RewardWallet.module.css";

export function RewardCouponTicket({ coupon }: { coupon: MyRewardCoupon }) {
  const { t } = useTranslation();
  const ready = coupon.state === "ready";
  const left = daysLeft(coupon.expiresAt);

  const stateLabel = {
    ready: t("referrals.couponReady", "Ready to use"),
    used: t("referrals.couponUsed", "Used"),
    expired: t("referrals.couponExpired", "Expired"),
    off: t("referrals.couponOff", "Turned off"),
  }[coupon.state];

  const detail =
    coupon.state === "used"
      ? coupon.usedFor
        ? t("referrals.usedOnFor", "Used {{date}} on {{item}}", {
            date: coupon.usedAt ? shortDate(coupon.usedAt) : "",
            item: coupon.usedFor,
          })
        : coupon.usedAt
          ? t("referrals.usedOn", "Used {{date}}", { date: shortDate(coupon.usedAt) })
          : t("referrals.usedAtCheckout", "Applied at checkout")
      : coupon.state === "expired"
        ? t("referrals.expiredOn", "Expired {{date}}", { date: coupon.expiresAt ? shortDate(coupon.expiresAt) : "" })
        : coupon.state === "off"
          ? t("referrals.offBody", "This coupon was turned off by support.")
          : left === null
            ? t("referrals.noExpiry", "No expiry")
            : left <= 1
              ? t("referrals.expiresToday", "Expires within a day")
              : t("referrals.expiresIn", "Expires in {{count}} days · {{date}}", {
                  count: left,
                  date: shortDate(coupon.expiresAt as string),
                });

  return (
    <article className={classes.ticket} data-state={coupon.state}>
      <div className={classes.value}>
        <span className={classes.percent}>{coupon.percentOff}%</span>
        <span className={classes.off}>{t("referrals.off", "off")}</span>
      </div>

      <div className={classes.body}>
        <div className={classes.topRow}>
          <Badge size="sm" variant="light" color={COUPON_STATE_COLOR[coupon.state]}>{stateLabel}</Badge>
          {ready && left !== null && left <= 3 && (
            <Badge size="sm" variant="outline" color="orange">{t("referrals.endingSoon", "Ending soon")}</Badge>
          )}
        </div>

        <div className={classes.codeRow}>
          <span className={classes.code} data-dim={!ready || undefined}>{coupon.code}</span>
          {ready && (
            <CopyButton value={coupon.code} timeout={1400}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("share.copied") : t("share.copy")} withArrow>
                  <ActionIcon size="sm" variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label={t("share.copy")}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          )}
        </div>

        <p className={classes.detail}>{detail}</p>

        {ready && (
          <Button
            component={Link}
            to="/app/billing"
            size="xs"
            variant="light"
            radius="md"
            rightSection={<ArrowRight size={13} />}
            className={classes.use}
          >
            {t("referrals.useNow", "Use on a plan")}
          </Button>
        )}
      </div>
    </article>
  );
}
