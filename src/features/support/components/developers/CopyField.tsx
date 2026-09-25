import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Developers.module.css";

interface Props {
  label: string;
  value: string;
}

export function CopyField({ label, value }: Props) {
  const { t } = useTranslation();

  return (
    <div className={classes.field}>
      <span className={classes.fieldLabel}>{label}</span>
      <code className={classes.fieldValue} title={value}>
        {value}
      </code>
      <CopyButton value={value} timeout={1600}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t("developers.copied") : t("developers.copyCode")} withArrow>
            <ActionIcon
              size="sm"
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
  );
}
