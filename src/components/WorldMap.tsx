import { useMemo, useState } from "react";
import { Card, Group, Text, Stack, Center, ThemeIcon } from "@mantine/core";
import { Globe2 } from "lucide-react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import { countryName } from "../utils";
import type { Bucket } from "../types";

// Emerald ramp: light (few visitors) -> dark (many). One hue, monotonic lightness.
const RAMP = ["#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857"];

const WIDTH = 800;
const HEIGHT = 380;

type Feature = {
  type: string;
  id?: string;
  properties: { name: string };
  geometry: unknown;
};

/** Project the world once — the topology never changes. */
function useWorldPaths() {
  return useMemo(() => {
    // topojson-client gives us GeoJSON features from the compact topology
    const fc = feature(topo as any, (topo as any).objects.countries) as unknown as {
      features: Feature[];
    };

    const projection = geoMercator()
      .scale(WIDTH / (2 * Math.PI))
      .translate([WIDTH / 2, HEIGHT / 1.55]);

    const path = geoPath(projection as any);

    return fc.features.map((f) => ({
      name: f.properties.name,
      d: path(f as any) ?? "",
    }));
  }, []);
}

export function WorldMap({ countries }: { countries: Bucket[] }) {
  const shapes = useWorldPaths();
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null);

  // Events store ISO-2 codes; the topology labels countries by name.
  const byName = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of countries) {
      const name = countryName(c.key);
      if (name) m.set(name, (m.get(name) ?? 0) + c.count);
    }
    return m;
  }, [countries]);

  const max = Math.max(1, ...byName.values());

  const fillFor = (name: string): string => {
    const v = byName.get(name);
    if (!v) return "var(--surface-2)";
    // log scale so one dominant country doesn't flatten everybody else
    const t = Math.log(v + 1) / Math.log(max + 1);
    return RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))];
  };

  const hasData = byName.size > 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} c="dimmed" size="sm">Visitors by country</Text>
        {hover && hover.count > 0 && (
          <Text size="xs" fw={600}>
            {hover.name} · {hover.count.toLocaleString()}
          </Text>
        )}
      </Group>

      {!hasData ? (
        <Center h={280}>
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" color="gray" size="xl" radius="md"><Globe2 size={22} /></ThemeIcon>
            <Text c="dimmed" size="xs">No location data yet</Text>
          </Stack>
        </Center>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="world-map"
            role="img"
            aria-label="Visitors by country"
          >
            {shapes.map((s) => {
              const count = byName.get(s.name) ?? 0;
              return (
                <path
                  key={s.name}
                  d={s.d}
                  fill={fillFor(s.name)}
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
            {RAMP.map((c) => (
              <span key={c} className="legend-swatch" style={{ background: c }} />
            ))}
            <Text size="xs" c="dimmed" ml={4}>More</Text>
          </Group>
        </>
      )}
    </Card>
  );
}
