import { Alert, Badge, Box, Button, Group, Loader, SimpleGrid, Stack, Switch, Text, useMantineTheme } from "@mantine/core";
import { BellRing, Info, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
} from "@/app/store";
import { notificationTypeLabel } from "@/features/activity/copy";
import { usePush } from "@/features/activity/usePush";
import { NOTIFICATION_VISUALS } from "@/features/activity/visuals";
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
  const theme = useMantineTheme();

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

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="md">
          {data.items.map((item) => {
            const visual = NOTIFICATION_VISUALS[item.type];
            const Icon = visual.icon;
            const accent = theme.colors[visual.color]?.[6] ?? theme.colors.gray[6];
            const wash = theme.colors[visual.color]?.[0] ?? theme.colors.gray[1];

            return (
              <Box key={item.type} className="surface-card" p="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap={10} wrap="nowrap" align="flex-start">
                    <Box
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                        background: visual.image ? undefined : wash,
                        color: accent,
                      }}
                    >
                      {visual.image ? (
                        <img
                          src={visual.image}
                          alt=""
                          width={34}
                          height={34}
                          style={{ borderRadius: 999, objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <Icon size={16} strokeWidth={2} />
                      )}
                    </Box>

                    <div>
                      <Text fz="sm" fw={500}>
                        {notificationTypeLabel(item.type, t)}
                      </Text>
                      {/*
                       * Security notices cannot be switched off, and the badge
                       * says so rather than leaving a disabled toggle to be
                       * read as a bug. The server refuses the change too —
                       * this is the explanation, not the enforcement.
                       */}
                      {!item.optional && (
                        <Badge
                          size="xs"
                          variant="light"
                          color="gray"
                          tt="none"
                          mt={4}
                          leftSection={<Lock size={10} />}
                        >
                          {t("activity.pref.always", "Always on")}
                        </Badge>
                      )}
                    </div>
                  </Group>
                </Group>

                <Group gap="xl" mt="md" pl={44}>
                  <Stack gap={4} align="center">
                    <Text fz={11} fw={600} c="dimmed">
                      {t("activity.pref.inApp", "In app")}
                    </Text>
                    <Switch
                      checked={item.inApp}
                      disabled={!item.optional}
                      onChange={(event) =>
                        void change(item.type, "inApp", event.currentTarget.checked)
                      }
                      aria-label={notificationTypeLabel(item.type, t)}
                    />
                  </Stack>

                  <Stack gap={4} align="center">
                    <Text fz={11} fw={600} c="dimmed">
                      {t("activity.pref.push", "Push")}
                    </Text>
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
                      // choice does not exist, where an off switch would imply
                      // it could be turned on.
                      <Text c="dimmed" fz="sm">
                        —
                      </Text>
                    )}
                  </Stack>
                </Group>
              </Box>
            );
          })}
        </SimpleGrid>
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
