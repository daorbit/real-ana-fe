import { ActionIcon, CopyButton, Group, TextInput, Tooltip } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Developers.module.css";

interface Props {
  value: string;
  label: string;
  onCopy?: () => void;
}

export function SecretKeyField({ value, label, onCopy }: Props) {
  const { t } = useTranslation();

  return (
    <Group gap="xs" wrap="nowrap">
      <TextInput
        readOnly
        value={value}
        className={classes.secretInput}
        flex={1}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={label}
      />
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t("developers.copied") : t("developers.copyKey")} withArrow>
            <ActionIcon
              size={36}
              variant={copied ? "filled" : "default"}
              color={copied ? "teal" : undefined}
              onClick={() => {
                copy();
                onCopy?.();
              }}
              aria-label={t("developers.copyKey")}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
