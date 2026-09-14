import { useState } from "react";
import { Alert, Button, Group, Loader, Paper, Radio, Stack, Text } from "@mantine/core";
import { AlertTriangle, MapPin } from "lucide-react";
import type { GoogleAvailableLocations } from "@/shared/types";

 
export function SelectBusiness({
  data,
  loading,
  error,
  connecting,
  onConnect,
}: {
  data?: GoogleAvailableLocations;
  loading: boolean;
  /** Our own wording from the server; never a raw Google message. */
  error?: string;
  connecting: boolean;
  onConnect: (location: {
    googleAccountId: string;
    googleLocationId: string;
    title: string;
    address: string;
  }) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading your business locations from Google…
        </Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<AlertTriangle size={16} />} title="Could not load your businesses">
        {error}
      </Alert>
    );
  }

  // No locations is a legitimate outcome rather than a failure — a Google
  // account with no Business Profile, most often — so it gets guidance on what
  // to do next instead of an error the user cannot act on.
  if (!data?.locations.length) {
    return (
      <Alert color="yellow" icon={<AlertTriangle size={16} />} title="No business locations found">
        {data?.message ??
          "This Google account has no Business Profile locations. Create one at business.google.com, then reconnect."}
      </Alert>
    );
  }

  const chosen = data.locations.find((l) => l.googleLocationId === selected);

  return (
    <Stack gap="md">
      <div>
        <Text fw={600}>Select business</Text>
        <Text size="sm" c="dimmed">
          Choose which Google business location to sync reviews from.
        </Text>
      </div>

      <Radio.Group value={selected} onChange={setSelected}>
        <Stack gap="sm">
          {data.locations.map((location) => (
            <Paper
              key={location.googleLocationId}
              withBorder
              p="md"
              radius="md"
              // The whole card is the target, not just the radio: a 16px dot is
              // a poor hit area, especially on a phone.
              onClick={() => setSelected(location.googleLocationId)}
              style={{
                cursor: "pointer",
                borderColor:
                  selected === location.googleLocationId
                    ? "var(--mantine-primary-color-filled)"
                    : undefined,
              }}
            >
              <Radio
                value={location.googleLocationId}
                label={
                  <Stack gap={2}>
                    <Text fw={600} size="sm">
                      {location.title}
                    </Text>
                    {location.address && (
                      <Group gap={4}>
                        <MapPin size={12} aria-hidden />
                        <Text size="xs" c="dimmed">
                          {location.address}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                }
              />
            </Paper>
          ))}
        </Stack>
      </Radio.Group>

      <Group>
        <Button
          disabled={!chosen}
          loading={connecting}
          onClick={() => chosen && onConnect(chosen)}
        >
          Connect
        </Button>
      </Group>
    </Stack>
  );
}
