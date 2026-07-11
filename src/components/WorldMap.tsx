import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Card, Group, Text, Stack, Center, ThemeIcon } from "@mantine/core";
import { Globe2 } from "lucide-react";
import topo from "world-atlas/countries-110m.json";
import { countryName } from "../utils";
import type { Bucket } from "../types";

// Emerald ramp: light (few visitors) -> dark (many). Single hue, monotonic lightness.
const RAMP = ["#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#047857"];

export function WorldMap({ countries }: { countries: Bucket[] }) {
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null);

  // topojson labels countries by name, our events store ISO-2 codes.
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
    // log scale so a single dominant country doesn't flatten everyone else
    const t = Math.log(v + 1) / Math.log(max + 1);
    return RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))];
  };

  const hasData = byName.size > 0;

  return (
    <Card withBorder radius="lg" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600} c="dimmed" size="sm">Visitors by country</Text>
        {hover && (
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
        <div className="world-map">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120 }}
            height={300}
            style={{ width: "100%", height: "auto" }}
          >
            <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={6}>
              <Geographies geography={topo}>
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    const name = geo.properties.name as string;
                    const count = byName.get(name) ?? 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillFor(name)}
                        stroke="var(--border)"
                        strokeWidth={0.4}
                        onMouseEnter={() => setHover({ name, count })}
                        onMouseLeave={() => setHover(null)}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: count ? "#065f46" : "var(--border-strong)", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* legend */}
          <Group gap={4} justify="flex-end" mt="xs" align="center">
            <Text size="xs" c="dimmed" mr={4}>Fewer</Text>
            {RAMP.map((c) => (
              <span key={c} className="legend-swatch" style={{ background: c }} />
            ))}
            <Text size="xs" c="dimmed" ml={4}>More</Text>
          </Group>
        </div>
      )}
    </Card>
  );
}
