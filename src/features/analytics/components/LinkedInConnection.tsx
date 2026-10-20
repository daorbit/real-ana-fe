import { useTranslation } from "react-i18next";
import { Anchor, Box, Button, Group, Loader, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { modals } from "@mantine/modals";
import { useLinkedInConnect } from "../hooks/useLinkedInConnect";
import { LINKEDIN_ICON, PlatformGlyph } from "./sharePlatforms";

export function LinkedInConnection({ onConnected }: { onConnected?: () => void }) {
  const { t } = useTranslation();
  const { status, isLoading, connecting, disconnecting, needsReconnect, needsPostingPermission, connect, disconnect } =
    useLinkedInConnect({ onConnected });

  const showDetails = () => {
    modals.open({
      title: (
        <Group gap={8} wrap="nowrap">
          <Box style={{ color: `#${LINKEDIN_ICON.hex}`, display: "flex" }}>
            <PlatformGlyph icon={LINKEDIN_ICON} size={15} />
          </Box>
          <Text size="sm" fw={600}>LinkedIn</Text>
        </Group>
      ),
      centered: true,
      radius: "lg",
      children: (
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {t("sharePost.linkedinScopeNote")}
        </Text>
      ),
    });
  };

  if (isLoading) {
    return (
      <Group gap={8} mt="md">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">LinkedIn</Text>
      </Group>
    );
  }

  if (status?.connected && !needsReconnect) {
    return (
      <Group gap={8} mt="md" wrap="nowrap">
        <Check size={14} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
        <Text size="xs" c="dimmed" truncate>
          {t("sharePost.linkedinConnectedAs", { name: status.profile?.name ?? "" })}
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
          {t("sharePost.linkedinDisconnect")}
        </Anchor>
      </Group>
    );
  }

  return (
    <Box mt="md">
      <Group gap={6} align="baseline" wrap="wrap" mb={10}>
        <Text size="xs" c="dimmed">
          {status?.configured === false
            ? t("sharePost.linkedinNotConfigured")
            : needsPostingPermission
              ? t("sharePost.linkedinNeedsPosting")
              : needsReconnect
                ? t("sharePost.linkedinExpired")
                : t("sharePost.linkedinConnectHint")}
        </Text>
        {status?.configured !== false && !needsReconnect && (
          <Anchor component="button" type="button" size="xs" onClick={showDetails}>
            {t("sharePost.linkedinSeeMore", "See more")}
          </Anchor>
        )}
      </Group>
      <Button
        size="sm"
        disabled={status?.configured === false}
        loading={connecting}
        onClick={connect}
        leftSection={<PlatformGlyph icon={LINKEDIN_ICON} />}
        style={status?.configured === false ? undefined : { background: `#${LINKEDIN_ICON.hex}`, color: "#fff" }}
      >
        {needsPostingPermission
          ? t("sharePost.linkedinEnablePosting")
          : needsReconnect
            ? t("sharePost.linkedinReconnect")
            : t("sharePost.linkedinConnect")}
      </Button>
    </Box>
  );
}
