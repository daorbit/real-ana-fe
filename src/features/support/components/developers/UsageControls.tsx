import { Group, SegmentedControl, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ApiKey, ApiKeyUsageWindow } from "@/shared/types";
import { USAGE_WINDOWS } from "../../developers";
import classes from "./Developers.module.css";

const ALL_KEYS = "all";

interface Props {
  keys: ApiKey[];
  windowDays: ApiKeyUsageWindow;
  onWindowChange: (days: ApiKeyUsageWindow) => void;
  focusKeyId: string | null;
  onFocusKey: (keyId: string | null) => void;
}

export function UsageControls({ keys, windowDays, onWindowChange, focusKeyId, onFocusKey }: Props) {
  const { t } = useTranslation();

  return (
    <Group gap="xs" wrap="wrap" className={classes.usageControls}>
      <Select
        size="xs"
        className={classes.keySelect}
        aria-label={t("developers.usageKeyFilter")}
        allowDeselect={false}
        value={focusKeyId ?? ALL_KEYS}
        onChange={(value) => onFocusKey(!value || value === ALL_KEYS ? null : value)}
        data={[
          { value: ALL_KEYS, label: t("developers.usageAllKeys") },
          ...keys.map((k) => ({ value: k.id, label: k.name })),
        ]}
      />
      <SegmentedControl
        size="xs"
        value={String(windowDays)}
        onChange={(value) => onWindowChange(Number(value) as ApiKeyUsageWindow)}
        data={USAGE_WINDOWS.map((days) => ({
          value: String(days),
          label: t("developers.rangeDays", { count: days }),
        }))}
      />
    </Group>
  );
}
