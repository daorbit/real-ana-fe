import { Box, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
} from "@/app/store";
import { usePush } from "@/features/activity/usePush";
import { notify, errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PushCard } from "./PushCard";
import { NotificationMatrix } from "./NotificationMatrix";
import { NotificationsSkeleton } from "./NotificationsSkeleton";
import { groupPreferences, type NotificationGroupId } from "./notificationGroups";
import classes from "./Notifications.module.css";

export function NotificationsPanel() {
  const { t } = useTranslation();
  const { data, isLoading, isError, isFetching, refetch } = useGetNotificationPreferencesQuery();
  const [update] = useUpdateNotificationPreferenceMutation();

  const { state: pushState, enable, disable, sendTest, testing } = usePush(
    data?.vapidPublicKey ?? "",
    data?.pushConfigured ?? false,
  );

  const change = async (type: string, channel: "inApp" | "push", value: boolean) => {
    try {
      await update({ type, [channel]: value }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, t("activity.prefSaveError", "Could not save that preference")));
    }
  };

  const note = (
    <Text className={classes.note} mb="md">
      {t("activity.pref.description", "Turning something off here stops it appearing in your activity panel.")}
    </Text>
  );

  if (isLoading) {
    return (
      <Box>
        {note}
        <NotificationsSkeleton />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={t("activity.pref.loadError", "Couldn't load your notification settings")}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  const test = async () => {
    try {
      await sendTest();
      notify.success(
        t(
          "activity.push.testSent",
          "Sent. If nothing pops up within a few seconds, your computer is blocking Chrome's notifications. On Windows, check Settings › System › Notifications and turn off Do not disturb.",
        ),
        t("activity.push.testSentTitle", "Test notification sent"),
      );
    } catch (e) {
      notify.error(errMessage(e, t("activity.push.testFailed", "Couldn't send a test notification.")));
    }
  };

  const pushOn = pushState === "on";
  const onChange = (type: string, channel: "inApp" | "push", value: boolean) =>
    void change(type, channel, value);
  const groups = groupPreferences(data.items).filter((g) => g.items.length > 0);
  const byId = (id: NotificationGroupId) => groups.find((g) => g.group.id === id);

  const renderGroup = (id: NotificationGroupId) => {
    const entry = byId(id);
    return entry ? (
      <NotificationMatrix group={entry.group} items={entry.items} pushOn={pushOn} onChange={onChange} />
    ) : null;
  };

  return (
    <Box>
      {note}
      <Box className={classes.layout}>
        <Box className={classes.column}>
          {renderGroup("account")}
          {renderGroup("billing")}
        </Box>
        <Box className={classes.column}>
          <PushCard
            state={pushState}
            onEnable={() => void enable()}
            onDisable={() => void disable()}
            onTest={() => void test()}
            testing={testing}
          />
          {renderGroup("activity")}
        </Box>
      </Box>
    </Box>
  );
}
