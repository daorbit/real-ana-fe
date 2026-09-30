import { Badge, Card, Center, Group, Stack, Text } from "@mantine/core";
import type { Bucket } from "@/shared/types";
import classes from "@/features/analytics/components/widgets/Widgets.module.css";

export function LivePagesCard({ live, pages }: { live: number; pages: Bucket[] }) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className={`status-dot live ${classes.liveDot}`} />
          <Text fw={600} c="dimmed" size="sm">Right now</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">{live}</Badge>
      </Group>
      {pages.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="xs" ta="center">Nobody on the site in the last 5 minutes</Text>
        </Center>
      ) : (
        <Stack gap="xs">
          {pages.map((p) => (
            <Group key={p.key} justify="space-between" gap="xs" wrap="nowrap">
              <Text size="sm" truncate className={classes.grow}>{p.key}</Text>
              <Badge variant="light" color="gray" size="sm">{p.count}</Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}
