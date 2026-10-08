import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import { countryCodeByName } from "@/shared/lib/countries";

export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 380;

type Feature = { type: string; properties: { name: string }; geometry: unknown };

export type CountryShape = { name: string; code: string | null; d: string };

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

    return fc.features.map((f) => ({
      name: f.properties.name,
      code: countryCodeByName(f.properties.name),
      d: path(f as never) ?? "",
    }));
  }, []);
}
