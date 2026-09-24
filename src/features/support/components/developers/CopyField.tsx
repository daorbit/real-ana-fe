import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Developers.module.css";

interface Props {
  label: string;
  value: string;
  href?: string;
}

export function CopyField({ label, value, href }: Props) {
  const { t } = useTranslation();

  return (
    <div className={classes.copyField}>
      <span className={classes.copyLabel}>{label}</span>
      <div className={classes.copyRow}>
        {href ? (
          <a className={`${classes.copyValue} ${classes.copyLink}`} href={href} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          <code className={classes.copyValue}>{value}</code>
        )}
        {href && (
          <Tooltip label={t("developers.openInNewTab")} withArrow>
            <ActionIcon
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              aria-label={`${t("developers.openInNewTab")}: ${label}`}
            >
              <ExternalLink size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        <CopyButton value={value} timeout={1600}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? t("developers.copied") : t("developers.copyCode")} withArrow>
              <ActionIcon
                variant="subtle"
                color={copied ? "teal" : "gray"}
                onClick={copy}
                aria-label={`${t("developers.copyCode")} ${label}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </div>
    </div>
  );
}
