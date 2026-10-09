import { useMemo, useState } from "react";
import { Card, Group, Text, Stack, Center, ThemeIcon, SegmentedControl } from "@mantine/core";
import { Globe2, Map as MapIcon, MapPinned, Satellite } from "lucide-react";
import { SatelliteMap } from "@/shared/ui/SatelliteMap";
import { countryName } from "@/shared/lib";
import type { Bucket } from "@/shared/types";
import { FlatWorldMap } from "@/shared/ui/worldMap/FlatWorldMap";

type MapView = "flat" | "basic" | "satellite";

const VIEWS: MapView[] = ["flat", "basic", "satellite"];

const readView = (): MapView => {
  const saved = localStorage.getItem("worldmap:view") as MapView | null;
  return saved && VIEWS.includes(saved) ? saved : "flat";
};

const VIEW_OPTIONS = [
  { value: "flat", icon: MapPinned, label: "Map with country labels" },
  { value: "basic", icon: MapIcon, label: "Basic map" },
  { value: "satellite", icon: Satellite, label: "Satellite map" },
].map(({ value, icon: Icon, label }) => ({
  value,
  label: (
    <Center h={16}>
      <Icon size={14} aria-label={label} />
    </Center>
  ),
}));

export function WorldMap({
  countries,
  liveCountries,
}: {
  countries: Bucket[];
  liveCountries?: Bucket[];
}) {
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null);
  const [view, setView] = useState<MapView>(readView);
  const [range, setRange] = useState<"24h" | "live">("24h");

  const setViewPersisted = (v: string) => {
    setView(v as MapView);
    localStorage.setItem("worldmap:view", v);
  };

  const activeCountries = range === "live" ? liveCountries ?? [] : countries;

  // Events store ISO-2 codes; the topology labels countries by name.
  const byName = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of activeCountries) {
      const name = countryName(c.key);
      if (name) m.set(name, (m.get(name) ?? 0) + c.count);
    }
    return m;
  }, [activeCountries]);

  const hasData = byName.size > 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="xs">
        <Text fw={600} c="dimmed" size="sm">Visitors by country</Text>
        <SegmentedControl
          size="xs"
          value={range}
          onChange={(v) => setRange(v as "24h" | "live")}
          data={[
            { value: "24h", label: "Last 24h" },
            { value: "live", label: "Live now" },
          ]}
        />
      </Group>
      <Group justify="space-between" mb="md">
        <Text size="xs" c="dimmed">
          {range === "live"
            ? `${activeCountries.reduce((s, c) => s + c.count, 0).toLocaleString()} online now`
            : " "}
        </Text>
        <Group gap="sm">
          {view !== "satellite" && hover && hover.count > 0 && (
            <Text size="xs" fw={600}>
              {hover.name} · {hover.count.toLocaleString()}
            </Text>
          )}
          <SegmentedControl
            size="xs"
            className="map-view-switch"
            value={view}
            onChange={setViewPersisted}
            data={VIEW_OPTIONS}
          />
        </Group>
      </Group>

      {!hasData ? (
        <Center h={280}>
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" color="gray" size="xl" radius="md"><Globe2 size={22} /></ThemeIcon>
            <Text c="dimmed" size="xs">No location data yet</Text>
          </Stack>
        </Center>
      ) : view === "satellite" ? (
        <SatelliteMap countries={activeCountries} />
      ) : (
        <FlatWorldMap byName={byName} spotlight={view === "flat"} onHover={setHover} />
      )}
    </Card>
  );
}
