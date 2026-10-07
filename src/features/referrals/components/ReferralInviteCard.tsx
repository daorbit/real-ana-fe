import { ActionIcon, Button, CopyButton, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Check, Copy, Gift, Mail, MessageCircle } from "lucide-react";
import type { MyReferrals } from "@/shared/types";
import { referralLink } from "../lib/pendingRef";
import classes from "./Referrals.module.css";

export function ReferralInviteCard({ data }: { data: MyReferrals }) {
  const { t } = useTranslation();
  const code = data.code ?? "";
  const link = referralLink(code);
  const percent = data.rewardPercentOff ?? 0;
  const days = data.rewardValidDays ?? 0;
  const message = t(
    "referrals.shareMessage",
    "I use Quantalog for analytics, SEO and lead capture. Sign up with my link: {{link}}",
    { link },
  );

  const steps = [
    t("referrals.step1", "Share your link with a friend or client."),
    data.qualifyOn === "first_payment"
      ? t("referrals.step2Payment", "They sign up and make their first purchase.")
      : t("referrals.step2Signup", "They create a Quantalog account."),
    t("referrals.step3", "You get a {{percent}}% off coupon, valid for {{days}} days.", { percent, days }),
  ];

  return (
    <section className={classes.card}>
      <div className={classes.head}>
        <span className={classes.headIcon}>
          <Gift size={18} />
        </span>
        <div>
          <h3 className={classes.title}>
            {t("referrals.title", "Give Quantalog, get {{percent}}% off", { percent })}
          </h3>
          <p className={classes.lede}>
            {t(
              "referrals.lede",
              "Every person who joins through your link earns you a single-use discount coupon for your next plan or addon purchase.",
            )}
          </p>
        </div>
      </div>

      <div className={classes.linkRow}>
        <div className={classes.urlBox}>
          <span className={classes.url} title={link}>{link}</span>
          <CopyButton value={link} timeout={1600}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("share.copied") : t("share.copy")} withArrow>
                <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label={t("share.copy")}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>
        <Button
          component="a"
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          variant="default"
          leftSection={<MessageCircle size={15} />}
        >
          WhatsApp
        </Button>
        <Button
          component="a"
          href={`mailto:?subject=${encodeURIComponent(t("referrals.mailSubject", "Try Quantalog"))}&body=${encodeURIComponent(message)}`}
          variant="default"
          leftSection={<Mail size={15} />}
        >
          {t("referrals.email", "Email")}
        </Button>
      </div>

      <span className={classes.stepNum}>
        {t("referrals.yourCode", "Your code")}: <span className={classes.code}>{code}</span>
      </span>

      <ol className={classes.steps}>
        {steps.map((text, i) => (
          <li key={i} className={classes.step}>
            <span className={classes.stepNum}>{i + 1}</span>
            <span className={classes.stepText}>{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
