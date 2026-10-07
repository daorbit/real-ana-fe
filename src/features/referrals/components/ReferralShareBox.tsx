import { ActionIcon, Button, CopyButton, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import { referralLink } from "../lib/pendingRef";
import classes from "./Referrals.module.css";

export function ReferralShareBox({ code }: { code: string }) {
  const { t } = useTranslation();
  const link = referralLink(code);
  const message = t(
    "referrals.shareMessage",
    "I use Quantalog for analytics, SEO and lead capture. Sign up with my link: {{link}}",
    { link },
  );
  const encoded = encodeURIComponent(message);

  const channels = [
    { label: "WhatsApp", icon: <MessageCircle size={14} />, href: `https://wa.me/?text=${encoded}` },
    {
      label: t("referrals.email", "Email"),
      icon: <Mail size={14} />,
      href: `mailto:?subject=${encodeURIComponent(t("referrals.mailSubject", "Try Quantalog"))}&body=${encoded}`,
    },
    {
      label: "LinkedIn",
      icon: <LinkedInMark size={13} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    },
  ];

  return (
    <div className={classes.share}>
      <span className={classes.fieldLabel}>{t("referrals.yourLink", "Your invite link")}</span>
      <div className={classes.linkField}>
        <span className={classes.url} title={link}>{link}</span>
        <CopyButton value={link} timeout={1600}>
          {({ copied, copy }) => (
            <Button
              size="sm"
              radius="md"
              color={copied ? "teal" : undefined}
              leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
              onClick={copy}
            >
              {copied ? t("share.copied") : t("referrals.copyLink", "Copy link")}
            </Button>
          )}
        </CopyButton>
      </div>

      <div className={classes.shareRow}>
        <div className={classes.channels}>
          {channels.map(({ label, icon, href }) => (
            <Button
              key={label}
              component="a"
              href={href}
              target="_blank"
              rel="noreferrer"
              variant="default"
              size="xs"
              radius="md"
              leftSection={icon}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className={classes.codeChip}>
          <span className={classes.codeChipLabel}>{t("referrals.yourCode", "Your code")}</span>
          <span className={classes.code}>{code}</span>
          <CopyButton value={code} timeout={1400}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("share.copied") : t("share.copy")} withArrow>
                <ActionIcon size="sm" variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label={t("share.copy")}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>
      </div>
    </div>
  );
}
