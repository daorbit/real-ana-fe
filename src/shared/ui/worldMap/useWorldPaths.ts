import { useMemo } from "react";
import { geoArea, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import { countryCodeByName } from "@/shared/lib/countries";

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 380;

type Geometry = { type: string; coordinates: unknown[] };

type Feature = { type: string; properties: { name: string }; geometry: Geometry };

export type CountryShape = {
  name: string;
  code: string | null;
  d: string;
  anchor: [number, number];
  bounds: [[number, number], [number, number]];
};

function mainland(geometry: Geometry): Geometry {
  if (geometry.type !== "MultiPolygon") return geometry;
  let best = geometry.coordinates[0];
  let bestArea = -1;
  for (const coordinates of geometry.coordinates) {
    const area = geoArea({ type: "Polygon", coordinates } as never);
    if (area > bestArea) {
      bestArea = area;
      best = coordinates;
    }
  }
  return { type: "Polygon", coordinates: best as unknown[] };
}

export function useWorldPaths(): CountryShape[] {
  return useMemo(() => {
    const atlas = topo as unknown as { objects: { countries: never } };
    const fc = feature(atlas as never, atlas.objects.countries) as unknown as {
      features: Feature[];
    };

    const projection = geoMercator()
      .scale(MAP_WIDTH / (2 * Math.PI))
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 1.55]);
    const path = geoPath(projection);

    return fc.features.map((f) => {
      const main = f.geometry ? (mainland(f.geometry) as never) : null;
      return {
        name: f.properties.name,
        code: countryCodeByName(f.properties.name),
        d: path(f as never) ?? "",
        anchor: main ? path.centroid(main) : [0, 0],
        bounds: main ? path.bounds(main) : [[0, 0], [0, 0]],
      };
    });
  }, []);
}
