import { Badge, Button, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { RefreshCw, Trash2 } from "lucide-react";
import type { GoogleReviewLocation } from "@/shared/types";
import classes from "./Reviews.module.css";

export function LocationCard({
  location,
  canAdmin,
  demo,
  syncing,
  onSync,
  onRemove,
}: {
  location: GoogleReviewLocation;
  canAdmin: boolean;
  demo: boolean;
  syncing: boolean;
  onSync: () => void;
  onRemove: () => void;
}) {
  const isPlace = location.source === "places";

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Stack gap={2} className={classes.locationText}>
          <Group gap="xs" wrap="wrap">
            <Text fw={600} size="sm">
              {location.title}
            </Text>
            {isPlace && (
              <Badge variant="light" color="gray" size="xs">
                Public reviews · latest 5
              </Badge>
            )}
          </Group>
          {location.address && (
            <Text size="xs" c="dimmed">
              {location.address}
            </Text>
          )}
          {location.lastSyncError && (
            <Text size="xs" c="red">
              {location.lastSyncError}
            </Text>
          )}
        </Stack>

        {canAdmin && (
          <Tooltip label="Demo data is read-only" disabled={!demo} withArrow>
            <Group gap="xs">
              <Button
                variant="light"
                size="xs"
                leftSection={<RefreshCw size={14} />}
                loading={syncing}
                disabled={demo}
                onClick={onSync}
              >
                Sync reviews
              </Button>
              {isPlace && (
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<Trash2 size={14} />}
                  disabled={demo}
                  onClick={onRemove}
                >
                  Remove
                </Button>
              )}
            </Group>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
}
