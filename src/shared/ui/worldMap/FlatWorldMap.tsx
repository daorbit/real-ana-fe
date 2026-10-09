import { useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { MAP_HEIGHT, MAP_WIDTH, useWorldPaths } from "./useWorldPaths";
import { buildSpotlights } from "./spotlight";
import { SPOTLIGHT_GLOW_ID, SpotlightGlow } from "./SpotlightDefs";
import { CountryCallout } from "./CountryCallout";
import { FLAG_PALETTES } from "./flagPalette";
import { FlagGradients, flagGradientId } from "./FlagGradients";
import { isIdentity, useMapZoom, zoomShape } from "./useMapZoom";
import { ZoomControls } from "./ZoomControls";

const SPOTLIGHT_LIMIT = 6;

const RAMP = [14, 22, 30, 38, 46, 56, 66].map(
  (pct) => `color-mix(in srgb, var(--accent) ${pct}%, var(--surface-2))`
);

const LEGEND = [0.4, 0.52, 0.64, 0.76, 0.88, 1].map(
  (o) => `color-mix(in srgb, var(--text) ${Math.round(o * 55)}%, var(--surface-2))`
);

const NO_SPOTS: never[] = [];

export function FlatWorldMap({
  byName,
  spotlight,
  onHover,
}: {
  byName: Map<string, number>;
  spotlight: boolean;
  onHover: (hover: { name: string; count: number } | null) => void;
}) {
  const shapes = useWorldPaths();
  const { ref, width } = useElementSize();
  const scale = width / MAP_WIDTH;
  const { surface, zoom, dragging, canZoomIn, canZoomOut, zoomIn, zoomOut, reset, dragHandlers } = useMapZoom();

  const max = Math.max(1, ...byName.values());
  const intensity = (v: number) => Math.log(v + 1) / Math.log(max + 1);

  const viewShapes = useMemo(
    () => (isIdentity(zoom) ? shapes : shapes.map((s) => zoomShape(s, zoom))),
    [shapes, zoom],
  );

  const spots = useMemo(
    () => (spotlight ? buildSpotlights(viewShapes, byName, SPOTLIGHT_LIMIT, scale) : NO_SPOTS),
    [spotlight, viewShapes, byName, scale],
  );

  const spotNames = useMemo(() => new Set(spots.map((s) => s.shape.name)), [spots]);
  const toneByName = useMemo(() => new Map(spots.map((s) => [s.shape.name, s.tone.from])), [spots]);

  const ordered = useMemo(
    () => [...shapes.filter((s) => !spotNames.has(s.name)), ...spots.map((s) => s.shape)],
    [shapes, spots, spotNames],
  );

  const active = useMemo(
    () => shapes.filter((s) => s.code && (byName.get(s.name) ?? 0) > 0),
    [shapes, byName],
  );

  const paintFor = (name: string, code: string | null): { fill: string; opacity: number } => {
    const v = byName.get(name);
    if (!v) return { fill: "var(--surface-2)", opacity: 1 };
    const spotlit = spotNames.has(name);
    const t = intensity(v);
    if (code && FLAG_PALETTES[code]) return { fill: `url(#${flagGradientId(code)})`, opacity: spotlit ? 1 : 0.4 + 0.6 * t };
    const tone = toneByName.get(name);
    if (tone) return { fill: tone, opacity: 1 };
    return { fill: RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))], opacity: 1 };
  };

  return (
    <>
      <div ref={ref} className="world-map-frame">
        <svg
          ref={surface}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className={`world-map${canZoomOut ? " zoomed" : ""}${dragging ? " dragging" : ""}`}
          role="img"
          aria-label="Visitors by country"
          {...dragHandlers}
        >
          <FlagGradients codes={active.map((s) => s.code as string)} />
          {spotlight && (
            <defs>
              <SpotlightGlow zoom={zoom.k} />
            </defs>
          )}
          <g transform={`translate(${zoom.x} ${zoom.y}) scale(${zoom.k})`}>
            {ordered.map((s) => {
              const count = byName.get(s.name) ?? 0;
              const spotlit = spotNames.has(s.name);
              const paint = paintFor(s.name, s.code);
              return (
                <path
                  key={s.name}
                  d={s.d}
                  fill={paint.fill}
                  fillOpacity={paint.opacity}
                  filter={spotlit ? `url(#${SPOTLIGHT_GLOW_ID})` : undefined}
                  className={spotlit ? "country has-data spotlit" : count ? "country has-data" : "country"}
                  onMouseEnter={() => onHover({ name: s.name, count })}
                  onMouseLeave={() => onHover(null)}
                >
                  {count > 0 && <title>{`${s.name}: ${count.toLocaleString()}`}</title>}
                </path>
              );
            })}
          </g>
          {spots.map((s) => (
            <CountryCallout key={s.shape.name} spot={s} />
          ))}
        </svg>
        <ZoomControls
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={reset}
        />
      </div>

      {!spotlight && (
        <Group gap={4} justify="flex-end" mt="xs" align="center">
          <Text size="xs" c="dimmed" mr={4}>Fewer</Text>
          {LEGEND.map((c) => (
            <Box key={c} component="span" className="legend-swatch" bg={c} />
          ))}
          <Text size="xs" c="dimmed" ml={4}>More</Text>
        </Group>
      )}
    </>
  );
}
