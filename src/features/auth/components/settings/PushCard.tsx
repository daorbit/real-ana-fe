import { Box, Button, Group, Switch, Text } from "@mantine/core";
import { BellRing, Info, MonitorSmartphone, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PushState } from "@/features/activity/usePush";
import { SettingsCard } from "./SettingsCard";
import classes from "./Notifications.module.css";

const STATUS: Record<PushState, { tone?: "on" | "warn"; key: string; label: string }> = {
  on: { tone: "on", key: "activity.push.statusOn", label: "Enabled" },
  off: { key: "activity.push.statusOff", label: "Off" },
  working: { key: "activity.push.statusWorking", label: "Updating…" },
  denied: { tone: "warn", key: "activity.push.statusDenied", label: "Blocked" },
  unsupported: { key: "activity.push.statusUnsupported", label: "Not supported" },
  unconfigured: { key: "activity.push.statusUnconfigured", label: "Unavailable" },
};

const HELP: Partial<Record<PushState, { key: string; text: string; tone?: "warn" }>> = {
  denied: {
    key: "activity.push.denied",
    text: "This browser is blocking notifications for the site. You'll need to allow them in your browser's site settings — it can't be re-asked from here.",
    tone: "warn",
  },
  unsupported: {
    key: "activity.push.unsupported",
    text: "This browser doesn't support push notifications. On iPhone and iPad, add the dashboard to your home screen first.",
  },
  unconfigured: {
    key: "activity.push.unconfigured",
    text: "Push notifications aren't set up on this deployment yet.",
  },
};

interface Props {
  state: PushState;
  onEnable: () => void;
  onDisable: () => void;
  onTest: () => void;
  testing: boolean;
}

export function PushCard({ state, onEnable, onDisable, onTest, testing }: Props) {
  const { t } = useTranslation();
  const status = STATUS[state];
  const help = HELP[state];
  const unavailable = state === "unsupported" || state === "unconfigured" || state === "denied";

  return (
    <SettingsCard
      icon={BellRing}
      title={t("activity.push.title", "Browser notifications")}
      description={t(
        "activity.push.description",
        "Get notified on this device even when the dashboard is closed. Each browser is registered separately.",
      )}
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Box className={classes.device}>
          <span className={classes.deviceIcon}>
            <MonitorSmartphone size={17} />
          </span>
          <Box>
            <Text size="sm" fw={600}>
              {t("activity.push.thisBrowser", "This browser")}
            </Text>
            <span className={classes.status} data-tone={status.tone}>
              {t(status.key, status.label)}
            </span>
          </Box>
        </Box>
        <Switch
          size="md"
          checked={state === "on"}
          disabled={state === "working" || unavailable}
          onChange={(event) => (event.currentTarget.checked ? onEnable() : onDisable())}
          aria-label={t("activity.push.title", "Browser notifications")}
        />
      </Group>

      {help && (
        <p className={classes.help} data-tone={help.tone}>
          <Info size={14} />
          {t(help.key, help.text)}
        </p>
      )}

      {state === "on" && (
        <Group justify="space-between" wrap="wrap" gap="sm" mt="md" className={classes.testRow}>
          <Text size="xs" c="dimmed" className={classes.testHint}>
            {t(
              "activity.push.scope",
              "Use the Push column below to choose which notifications pop up on this device.",
            )}
          </Text>
          <Button size="xs" radius="xl" variant="default" leftSection={<Send size={13} />} loading={testing} onClick={onTest}>
            {t("activity.push.test", "Send test notification")}
          </Button>
        </Group>
      )}
    </SettingsCard>
  );
}
