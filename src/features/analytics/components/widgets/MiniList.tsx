import type { ReactNode } from "react";
import { Card, Center, Group, Progress, Stack, Text } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import { num } from "@/shared/lib";
import type { Bucket } from "@/shared/types";
import classes from "@/features/analytics/components/widgets/Widgets.module.css";

export function MiniList({
  title,
  items,
  icon: Icon,
  format,
  empty,
}: {
  title: string;
  items: Bucket[];
  icon: LucideIcon;
  format?: (key: string) => ReactNode;
  empty: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <Icon size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>
      {items.length === 0 ? (
        <Center py="lg"><Text c="dimmed" size="xs">{empty}</Text></Center>
      ) : (
        <Stack gap="sm">
          {items.slice(0, 6).map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={3} wrap="nowrap">
                <Text size="sm" truncate className={classes.grow}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Text size="sm" fw={700}>{num(i.count)}</Text>
              </Group>
              <Progress value={(i.count / max) * 100} size="xs" radius="xl" color="teal" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
