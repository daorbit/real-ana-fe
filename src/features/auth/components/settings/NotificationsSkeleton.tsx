import { Box, Group, Skeleton } from "@mantine/core";
import { BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsCard } from "./SettingsCard";
import { NOTIFICATION_GROUPS, type NotificationGroup, type NotificationGroupId } from "./notificationGroups";
import classes from "./Notifications.module.css";

const LABEL_WIDTHS = ["52%", "38%", "46%", "34%", "58%", "42%", "48%"];

function MatrixSkeleton({ group }: { group: NotificationGroup }) {
  const { t } = useTranslation();

  return (
    <SettingsCard
      icon={group.icon}
      title={t(group.titleKey, group.title)}
      description={t(group.descriptionKey, group.description)}
      flush
    >
      <Box className={classes.matrix} aria-hidden>
        <Box className={`${classes.row} ${classes.headRow}`}>
          <span className={classes.colHead}>{t("activity.pref.type", "Notification")}</span>
          <span className={`${classes.colHead} ${classes.cell}`}>{t("activity.pref.inApp", "In app")}</span>
          <span className={`${classes.colHead} ${classes.cell}`}>{t("activity.pref.push", "Push")}</span>
        </Box>

        {group.types.map((type, i) => (
          <Box key={type} className={classes.row}>
            <Box className={classes.type}>
              <Skeleton width={32} height={32} radius={9} />
              <Skeleton height={12} width={LABEL_WIDTHS[i % LABEL_WIDTHS.length]} radius="xl" />
            </Box>
            <Box className={classes.cell}>
              <Skeleton width={38} height={20} radius="xl" />
            </Box>
            <Box className={classes.cell}>
              <Skeleton width={38} height={20} radius="xl" />
            </Box>
          </Box>
        ))}
      </Box>
    </SettingsCard>
  );
}

function PushCardSkeleton() {
  const { t } = useTranslation();

  return (
    <SettingsCard
      icon={BellRing}
      title={t("activity.push.title", "Browser notifications")}
      description={t(
        "activity.push.description",
        "Get notified on this device even when the dashboard is closed. Each browser is registered separately.",
      )}
    >
      <Group justify="space-between" wrap="nowrap" gap="md" aria-hidden>
        <Box className={classes.device}>
          <Skeleton width={36} height={36} radius={10} />
          <Box>
            <Skeleton width={90} height={12} radius="xl" />
            <Skeleton width={64} height={18} radius="xl" mt={6} />
          </Box>
        </Box>
        <Skeleton width={46} height={24} radius="xl" />
      </Group>
    </SettingsCard>
  );
}

export function NotificationsSkeleton() {
  const group = (id: NotificationGroupId) => NOTIFICATION_GROUPS.find((g) => g.id === id)!;

  return (
    <Box className={classes.layout}>
      <Box className={classes.column}>
        <MatrixSkeleton group={group("account")} />
        <MatrixSkeleton group={group("billing")} />
      </Box>
      <Box className={classes.column}>
        <PushCardSkeleton />
        <MatrixSkeleton group={group("activity")} />
      </Box>
    </Box>
  );
}
