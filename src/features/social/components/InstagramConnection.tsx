import { useTranslation } from "react-i18next";
import { Anchor, Box, Button, Group, Loader, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { modals } from "@mantine/modals";
import { INSTAGRAM_PINK, InstagramMark } from "@/shared/ui/LinkedInMark";
import { useInstagramConnect } from "../hooks/useInstagramConnect";

export function InstagramConnection({ onConnected }: { onConnected?: () => void }) {
  const { t } = useTranslation();
  const { status, isLoading, connecting, disconnecting, needsReconnect, needsPostingPermission, connect, disconnect } =
    useInstagramConnect({ onConnected });

  const showDetails = () => {
    modals.open({
      title: (
        <Group gap={8} wrap="nowrap">
          <InstagramMark size={15} />
          <Text size="sm" fw={600}>Instagram</Text>
        </Group>
      ),
      centered: true,
      radius: "lg",
      children: (
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {t(
            "settings.instagramScopeNote",
            "Quantalog only reads your username and publishes the posts you schedule here. It cannot read your messages, comments, or followers.",
          )}
        </Text>
      ),
    });
  };

  if (isLoading) {
    return (
      <Group gap={8} mt="md">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">Instagram</Text>
      </Group>
    );
  }

  if (status?.connected && !needsReconnect) {
    return (
      <Group gap={8} mt="md" wrap="nowrap">
        <Check size={14} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
        <Text size="xs" c="dimmed" truncate>
          {t("settings.instagramConnectedAs", "Connected as @{{name}}", { name: status.profile?.username ?? "" })}
        </Text>
        <Anchor
          component="button"
          type="button"
          size="xs"
          c="dimmed"
          underline="always"
          disabled={disconnecting}
          onClick={disconnect}
          style={{ flexShrink: 0 }}
        >
          {t("settings.instagramDisconnect", "Disconnect")}
        </Anchor>
      </Group>
    );
  }

  return (
    <Box mt="md">
      <Group gap={6} align="baseline" wrap="wrap" mb={10}>
        <Text size="xs" c="dimmed">
          {status?.configured === false
            ? t("settings.instagramNotConfigured", "Instagram is not set up on this deployment yet.")
            : needsPostingPermission
              ? t("settings.instagramNeedsPosting", "Connected, but publishing was not allowed. Reconnect to grant it.")
              : needsReconnect
                ? t("settings.instagramExpired", "Your Instagram connection has expired. Reconnect to keep publishing.")
                : t(
                    "settings.instagramConnectHint",
                    "Connect an Instagram Business or Creator account to publish scheduled posts.",
                  )}
        </Text>
        {status?.configured !== false && !needsReconnect && (
          <Anchor component="button" type="button" size="xs" onClick={showDetails}>
            {t("settings.instagramSeeMore", "See more")}
          </Anchor>
        )}
      </Group>
      <Button
        size="sm"
        disabled={status?.configured === false}
        loading={connecting}
        onClick={connect}
        leftSection={<InstagramMark size={15} color="#fff" />}
        style={status?.configured === false ? undefined : { background: INSTAGRAM_PINK, color: "#fff" }}
      >
        {needsPostingPermission
          ? t("settings.instagramEnablePosting", "Enable posting")
          : needsReconnect
            ? t("settings.instagramReconnect", "Reconnect Instagram")
            : t("settings.instagramConnect", "Connect Instagram")}
      </Button>
    </Box>
  );
}
