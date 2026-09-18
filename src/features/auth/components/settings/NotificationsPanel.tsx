import { Alert, Badge, Box, Button, Group, Loader, Stack, Switch, Text } from "@mantine/core";
import { BellRing, Info, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
} from "@/app/store";
import { notificationTypeLabel } from "@/features/activity/copy";
import { usePush } from "@/features/activity/usePush";
import { notify, errMessage } from "@/shared/lib/notify";

/**
 * Which notifications reach this account, and where.
 *
 * Two channels per type: the panel in the app, and a browser push. Email is
 * deliberately absent — the messages that go out by mail (receipts, invitations,
 * plan reminders) are sent by the parts of the product that own those events,
 * and are not something this screen turns on and off.
 */
export function NotificationsPanel() {
  const { t } = useTranslation();

  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [update] = useUpdateNotificationPreferenceMutation();

  const { state: pushState, enable, disable } = usePush(
    data?.vapidPublicKey ?? "",
    data?.pushConfigured ?? false,
  );

  const change = async (
    type: string,
    channel: "inApp" | "push",
    value: boolean,
  ) => {
    try {
      await update({ type, [channel]: value }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, t("activity.prefSaveError", "Could not save that preference")));
    }
  };

  if (isLoading || !data) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
      </Group>
    );
  }

  const pushOn = pushState === "on";
  const pushBusy = pushState === "working";

  return (
    <Stack gap="lg">
      {/*
       * The browser-level switch sits above the per-type grid, because it gates
       * the whole column: turning a type's push on means nothing until this
       * browser is registered to receive any.
       */}
      <div>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Group gap={8}>
              <BellRing size={16} />
              <Text fw={600} fz="sm">
                {t("activity.push.title", "Browser notifications")}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" mt={4} style={{ maxWidth: "58ch", lineHeight: 1.6 }}>
              {t(
                "activity.push.description",
                "Get notified on this device even when the dashboard is closed. Each browser is registered separately.",
              )}
            </Text>
          </div>

          <Switch
            checked={pushOn}
            disabled={
              pushBusy ||
              pushState === "unsupported" ||
              pushState === "unconfigured" ||
              pushState === "denied"
            }
            onChange={(event) =>
              void (event.currentTarget.checked ? enable() : disable())
            }
          />
        </Group>

        {/*
         * Each unavailable state gets its own sentence rather than one generic
         * "unavailable": the reader's next action is different in every case,
         * and only one of them is something they can fix.
         */}
        {pushState === "denied" && (
          <Alert color="orange" variant="light" mt="sm" icon={<Info size={15} />}>
            {t(
              "activity.push.denied",
              "This browser is blocking notifications for the site. You'll need to allow them in your browser's site settings — it can't be re-asked from here.",
            )}
          </Alert>
        )}

        {pushState === "unsupported" && (
          <Alert color="gray" variant="light" mt="sm" icon={<Info size={15} />}>
            {t(
              "activity.push.unsupported",
              "This browser doesn't support push notifications. On iPhone and iPad, add the dashboard to your home screen first.",
            )}
          </Alert>
        )}

        {pushState === "unconfigured" && (
          <Alert color="gray" variant="light" mt="sm" icon={<Info size={15} />}>
            {t(
              "activity.push.unconfigured",
              "Push notifications aren't set up on this deployment yet.",
            )}
          </Alert>
        )}
      </div>

      <div>
        <Text fw={600} fz="sm">
          {t("activity.pref.title", "What you get notified about")}
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          {t(
            "activity.pref.description",
            "Turning something off here stops it appearing in your activity panel.",
          )}
        </Text>

        {/* Column labels once, above the cards, rather than repeated on each
            one — the two switches read the same way down the list without it. */}
        <Group justify="flex-end" gap="xl" mt="md" pr="sm">
          <Text fz="xs" fw={600} c="dimmed" w={70} ta="center">
            {t("activity.pref.inApp", "In app")}
          </Text>
          <Text fz="xs" fw={600} c="dimmed" w={70} ta="center">
            {t("activity.pref.push", "Push")}
          </Text>
        </Group>

        <Stack gap={8} mt={6}>
          {data.items.map((item) => (
            <Box key={item.type} className="surface-card" px="md" py="sm">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap={8} wrap="nowrap">
                  <Text fz="sm" fw={500}>
                    {notificationTypeLabel(item.type, t)}
                  </Text>
                  {/*
                   * Security notices cannot be switched off, and the badge
                   * says so rather than leaving a disabled toggle to be read
                   * as a bug. The server refuses the change too — this is the
                   * explanation, not the enforcement.
                   */}
                  {!item.optional && (
                    <Badge
                      size="xs"
                      variant="light"
                      color="gray"
                      tt="none"
                      leftSection={<Lock size={10} />}
                    >
                      {t("activity.pref.always", "Always on")}
                    </Badge>
                  )}
                </Group>

                <Group gap="xl" wrap="nowrap">
                  <Box w={70} style={{ display: "grid", justifyContent: "center" }}>
                    <Switch
                      checked={item.inApp}
                      disabled={!item.optional}
                      onChange={(event) =>
                        void change(item.type, "inApp", event.currentTarget.checked)
                      }
                      aria-label={notificationTypeLabel(item.type, t)}
                    />
                  </Box>

                  <Box w={70} style={{ display: "grid", justifyContent: "center" }}>
                    {item.pushable ? (
                      <Switch
                        checked={item.push && pushOn}
                        // A push preference is meaningless until the browser is
                        // registered, so the column stays inert until it is.
                        disabled={!item.optional || !pushOn}
                        onChange={(event) =>
                          void change(item.type, "push", event.currentTarget.checked)
                        }
                        aria-label={`${notificationTypeLabel(item.type, t)} — ${t("activity.pref.push", "Push")}`}
                      />
                    ) : (
                      // Not every type earns an interruption. A dash says the
                      // choice does not exist, where an off switch would imply it
                      // could be turned on.
                      <Text c="dimmed" fz="sm" ta="center">
                        —
                      </Text>
                    )}
                  </Box>
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      </div>

      {pushState === "off" && data.pushConfigured && (
        <Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<BellRing size={14} />}
            loading={pushBusy}
            onClick={() => void enable()}
          >
            {t("activity.push.enable", "Enable on this browser")}
          </Button>
        </Group>
      )}
    </Stack>
  );
}
