import { useEffect, useState } from "react";
import { Button, Group, Loader, Paper, Radio, Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { MapPin, Search } from "lucide-react";
import { useConnectGooglePlaceMutation, useSearchGooglePlacesQuery } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import type { GooglePlaceResult } from "@/shared/types";
import classes from "./Reviews.module.css";

const EMPTY: GooglePlaceResult[] = [];
const MIN_QUERY = 2;

export function FindBusiness({ workspaceId }: { workspaceId: string }) {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query.trim(), 350);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const searchable = debounced.length >= MIN_QUERY;
  const { data, isFetching, error } = useSearchGooglePlacesQuery(
    { workspaceId, q: debounced },
    { skip: !workspaceId || !searchable },
  );
  const [connectPlace, { isLoading: connecting }] = useConnectGooglePlaceMutation();

  useEffect(() => {
    if (error) notifyError(error);
  }, [error]);

  const places = searchable ? data?.places ?? EMPTY : EMPTY;
  const chosen = places.find((place) => place.placeId === selectedId);

  const handleConnect = async () => {
    if (!chosen) return;
    try {
      const result = await connectPlace({ workspaceId, ...chosen }).unwrap();
      if (result.syncError) notify.error(result.syncError);
      else notify.success(`${chosen.title} connected`);
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600}>Find your business on Google</Text>
        <Text size="sm" c="dimmed">
          Shows your Google rating, total review count and the 5 latest public reviews. No Google
          sign-in needed.
        </Text>
      </div>

      <TextInput
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setSelectedId(null);
        }}
        placeholder="Business name and city, e.g. Acme Bakery Pune"
        leftSection={<Search size={15} />}
        rightSection={isFetching ? <Loader size={14} /> : undefined}
        aria-label="Search for your business"
      />

      {searchable && !isFetching && !error && !places.length && (
        <Text size="sm" c="dimmed">
          No matching businesses found. Try adding the city or area.
        </Text>
      )}

      {places.length > 0 && (
        <Radio.Group value={selectedId} onChange={setSelectedId}>
          <Stack gap="sm" className={classes.results}>
            {places.map((place) => (
              <Paper
                key={place.placeId}
                withBorder
                p="md"
                radius="md"
                className={
                  selectedId === place.placeId
                    ? `${classes.option} ${classes.optionSelected}`
                    : classes.option
                }
                onClick={() => setSelectedId(place.placeId)}
              >
                <Radio
                  value={place.placeId}
                  label={
                    <Stack gap={2}>
                      <Text fw={600} size="sm">
                        {place.title}
                      </Text>
                      {place.address && (
                        <Group gap={4} wrap="nowrap">
                          <MapPin size={12} aria-hidden />
                          <Text size="xs" c="dimmed">
                            {place.address}
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
      )}

      <Group>
        <Button disabled={!chosen} loading={connecting} onClick={handleConnect}>
          Connect
        </Button>
      </Group>
    </Stack>
  );
}
