import { Box, Button, Card, Stack, Text } from "@mantine/core";
import { CalendarClock, Plus } from "lucide-react";


export function PostsEmptyState({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: () => void;
}) {
  return (
    <Card withBorder radius="md" py={64} px="xl">
      <Stack align="center" gap={0} style={{ maxWidth: "42ch", margin: "0 auto" }}>
        <Box
          aria-hidden
          style={{
            width: 64,
            height: 64,
            display: "grid",
            placeItems: "center",
            borderRadius: 16,
            marginBottom: 20,
            background: "var(--mantine-color-default)",
            border: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <CalendarClock size={28} style={{ color: "var(--mantine-color-dimmed)" }} />
        </Box>
        <Text fw={650} fz="lg">Nothing scheduled yet</Text>
        <Text size="sm" c="dimmed" ta="center" mt={6} style={{ lineHeight: 1.6 }}>
          Write a post, pick a date and time, and Quantalog publishes it for you — once, or on a
          repeating schedule.
        </Text>
        <Button mt="xl" size="md" leftSection={<Plus size={16} />} disabled={disabled} onClick={onCreate}>
          Schedule your first post
        </Button>
      </Stack>
    </Card>
  );
}
