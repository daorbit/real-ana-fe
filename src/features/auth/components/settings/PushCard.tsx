import { Alert, Badge, Box, Group, Switch, Text } from "@mantine/core";
import { BellRing, Info, MonitorSmartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PushState } from "@/features/activity/usePush";
import { SettingsCard } from "./SettingsCard";
import classes from "./Notifications.module.css";

const STATUS: Record<PushState, { color: string; key: string; label: string }> = {
  on: { color: "green", key: "activity.push.statusOn", label: "Enabled" },
  off: { color: "gray", key: "activity.push.statusOff", label: "Off" },
  working: { color: "gray", key: "activity.push.statusWorking", label: "Updating…" },
  denied: { color: "orange", key: "activity.push.statusDenied", label: "Blocked" },
  unsupported: { color: "gray", key: "activity.push.statusUnsupported", label: "Not supported" },
  unconfigured: { color: "gray", key: "activity.push.statusUnconfigured", label: "Unavailable" },
};

const HELP: Partial<Record<PushState, { key: string; text: string; color: string }>> = {
  denied: {
    key: "activity.push.denied",
    text: "This browser is blocking notifications for the site. You'll need to allow them in your browser's site settings — it can't be re-asked from here.",
    color: "orange",
  },
  unsupported: {
    key: "activity.push.unsupported",
    text: "This browser doesn't support push notifications. On iPhone and iPad, add the dashboard to your home screen first.",
    color: "gray",
  },
  unconfigured: {
    key: "activity.push.unconfigured",
    text: "Push notifications aren't set up on this deployment yet.",
    color: "gray",
  },
};

interface Props {
  state: PushState;
  onEnable: () => void;
  onDisable: () => void;
}

export function PushCard({ state, onEnable, onDisable }: Props) {
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
            <Badge size="sm" variant="light" color={status.color} mt={4}>
              {t(status.key, status.label)}
            </Badge>
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
        <Alert color={help.color} variant="light" mt="md" icon={<Info size={15} />}>
          {t(help.key, help.text)}
        </Alert>
      )}
    </SettingsCard>
  );
}
