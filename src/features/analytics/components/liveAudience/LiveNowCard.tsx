import { Badge, Card, Center, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { LiveAudience } from "@/shared/types";
import { audienceSegments } from "./audienceMeta";
import { AudienceBar, AudienceLegend } from "./AudienceBar";
import { LiveVisitorList } from "./LiveVisitorList";
import classes from "./LiveAudience.module.css";

export function LiveNowCard({
  pages,
  total,
  audience,
}: {
  pages: { key: string; count: number }[];
  total: number;
  audience: LiveAudience | null;
}) {
  const { t } = useTranslation();
  const people = audience ? audience.humans : total;
  const segments = audience ? audienceSegments(audience) : [];
  const nobody = audience ? audience.total === 0 : pages.length === 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className={`status-dot live ${classes.liveDot}`} />
          <Text fw={600} c="dimmed" size="sm">{t("analytics.rightNow")}</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">
          {people} {audience ? (people === 1 ? "person" : "people") : people === 1 ? "visitor" : "visitors"}
        </Badge>
      </Group>

      {nobody ? (
        <Center py="lg">
          <Text c="dimmed" size="xs">{t("analytics.nobodyOnSite")}</Text>
        </Center>
      ) : (
        <>
          {audience && (
            <>
              <AudienceBar segments={segments} />
              <AudienceLegend segments={segments} />
              {audience.visitors.length > 0 && (
                <>
                  <div className={classes.sectionLabel}>Who is on the site</div>
                  <LiveVisitorList audience={audience} />
                </>
              )}
            </>
          )}

          {pages.length > 0 && (
            <Stack gap="xs">
              <div className={classes.sectionLabel}>Active pages</div>
              {pages.map((p) => (
                <Group key={p.key} justify="space-between" gap="xs" wrap="nowrap">
                  <Text size="sm" truncate className={classes.pageKey}>{p.key}</Text>
                  <Badge variant="light" color="gray" size="sm">{p.count}</Badge>
                </Group>
              ))}
            </Stack>
          )}
        </>
      )}
    </Card>
  );
}
