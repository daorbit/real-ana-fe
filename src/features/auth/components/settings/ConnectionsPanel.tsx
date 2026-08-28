import type { ReactNode } from "react";
import { Badge, Box, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { LinkedInConnection } from "@/features/analytics/components/LinkedInConnection";
import { InstagramConnection } from "@/features/social/components/InstagramConnection";
import {
  FACEBOOK_BLUE,
  FacebookMark,
  INSTAGRAM_PINK,
  InstagramMark,
  LINKEDIN_BLUE,
  LinkedInMark,
} from "@/shared/ui/LinkedInMark";

function ConnectionCard({
  mark,
  tint,
  name,
  hint,
  soon,
  children,
}: {
  mark: ReactNode;
  tint: string;
  name: string;
  hint: string;
  soon?: boolean;
  children?: ReactNode;
}) {
  return (
    <Box className="connection-card" style={{ opacity: soon ? 0.55 : 1 }}>
      <Box
        aria-hidden
        className="connection-card__mark"
        style={{ background: `color-mix(in srgb, ${tint} 16%, transparent)` }}
      >
        {mark}
      </Box>

      <Group gap={8} wrap="nowrap" align="center" mt="md">
        <Text fw={600}>{name}</Text>
        {soon && (
          <Badge size="xs" variant="light" color="gray">
            Coming soon
          </Badge>
        )}
      </Group>
      <Text size="sm" c="dimmed" mt={4} style={{ flex: 1 }}>
        {hint}
      </Text>

      <Box mt="md">{children}</Box>
    </Box>
  );
}

export function ConnectionsPanel() {
  const { t } = useTranslation();

  return (
    <>
      <Box mb="lg">
        <Text fw={650} size="sm" style={{ letterSpacing: "-0.01em" }}>
          {t("settings.connectionsTitle", "Connected accounts")}
        </Text>
        <Text c="dimmed" size="xs" mt={2}>
          {t(
            "settings.connectionsHint",
            "Networks Quantalog can publish your scheduled posts to.",
          )}
        </Text>
      </Box>

      <div className="connection-grid">
        <ConnectionCard
          mark={<LinkedInMark size={26} />}
          tint={LINKEDIN_BLUE}
          name="LinkedIn"
          hint="Publishing account for scheduled social posts."
        >
          <LinkedInConnection />
        </ConnectionCard>

        <ConnectionCard
          mark={<InstagramMark size={26} />}
          tint={INSTAGRAM_PINK}
          name="Instagram"
          hint="Feed posts from the same composer."
        >
          <InstagramConnection />
        </ConnectionCard>

        <ConnectionCard
          mark={<FacebookMark size={26} />}
          tint={FACEBOOK_BLUE}
          name="Facebook"
          hint="Pages and profile posting."
          soon
        />
      </div>
    </>
  );
}
