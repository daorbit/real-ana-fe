import { useMemo, useState } from "react";
import { Card, Group, Text, Stack, Center, ThemeIcon, SegmentedControl } from "@mantine/core";
import { Globe2, Map as MapIcon, Satellite } from "lucide-react";
import { SatelliteMap } from "@/shared/ui/SatelliteMap";
import { countryName } from "@/shared/lib";
import type { Bucket } from "@/shared/types";
import { MAP_HEIGHT as HEIGHT, MAP_WIDTH as WIDTH, useWorldPaths } from "@/shared/ui/worldMap/useWorldPaths";
import { FLAG_PALETTES } from "@/shared/ui/worldMap/flagPalette";
import { FlagGradients, flagGradientId } from "@/shared/ui/worldMap/FlagGradients";

const RAMP = [14, 22, 30, 38, 46, 56, 66].map(
  (pct) => `color-mix(in srgb, var(--accent) ${pct}%, var(--surface-2))`
);

const LEGEND = [0.4, 0.52, 0.64, 0.76, 0.88, 1].map(
  (o) => `color-mix(in srgb, var(--text) ${Math.round(o * 55)}%, var(--surface-2))`
);

export function WorldMap({
  countries,
  liveCountries,
}: {
  countries: Bucket[];
  liveCountries?: Bucket[];
}) {
  const shapes = useWorldPaths();
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null);
  const [view, setView] = useState<"flat" | "satellite">(
    () => (localStorage.getItem("worldmap:view") as "flat" | "satellite") ?? "flat"
  );
  const [range, setRange] = useState<"24h" | "live">("24h");

  const setViewPersisted = (v: string) => {
    setView(v as "flat" | "satellite");
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

  const max = Math.max(1, ...byName.values());

  const intensity = (v: number) => Math.log(v + 1) / Math.log(max + 1);

  const paintFor = (name: string, code: string | null): { fill: string; opacity: number } => {
    const v = byName.get(name);
    if (!v) return { fill: "var(--surface-2)", opacity: 1 };
    const t = intensity(v);
    if (code && FLAG_PALETTES[code]) return { fill: `url(#${flagGradientId(code)})`, opacity: 0.4 + 0.6 * t };
    return { fill: RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))], opacity: 1 };
  };

  const active = useMemo(
    () => shapes.filter((s) => s.code && (byName.get(s.name) ?? 0) > 0),
    [shapes, byName],
  );

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
            : " "}
        </Text>
        <Group gap="sm">
          {view === "flat" && hover && hover.count > 0 && (
            <Text size="xs" fw={600}>
              {hover.name} · {hover.count.toLocaleString()}
            </Text>
          )}
          <SegmentedControl
            size="xs"
            className="map-view-switch"
            value={view}
            onChange={setViewPersisted}
            data={[
              {
                value: "flat",
                label: (
                  <Center h={16}>
                    <MapIcon size={14} aria-label="Flat map" />
                  </Center>
                ),
              },
              {
                value: "satellite",
                label: (
                  <Center h={16}>
                    <Satellite size={14} aria-label="Satellite map" />
                  </Center>
                ),
              },
            ]}
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
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="world-map"
            role="img"
            aria-label="Visitors by country"
          >
            <FlagGradients codes={active.map((s) => s.code as string)} />
            {shapes.map((s) => {
              const count = byName.get(s.name) ?? 0;
              const paint = paintFor(s.name, s.code);
              return (
                <path
                  key={s.name}
                  d={s.d}
                  fill={paint.fill}
                  fillOpacity={paint.opacity}
                  stroke="var(--border)"
                  strokeWidth={0.4}
                  className={count ? "country has-data" : "country"}
                  onMouseEnter={() => setHover({ name: s.name, count })}
                  onMouseLeave={() => setHover(null)}
                >
                  {count > 0 && <title>{`${s.name}: ${count.toLocaleString()}`}</title>}
                </path>
              );
            })}
          </svg>

          <Group gap={4} justify="flex-end" mt="xs" align="center">
            <Text size="xs" c="dimmed" mr={4}>Fewer</Text>
            {LEGEND.map((c) => (
              <span key={c} className="legend-swatch" style={{ background: c }} />
            ))}
            <Text size="xs" c="dimmed" ml={4}>More</Text>
          </Group>
        </>
      )}
    </Card>
  );
}
