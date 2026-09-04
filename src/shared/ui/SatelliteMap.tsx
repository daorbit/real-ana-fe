import { useCallback, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import { countryName } from "@/shared/lib";
import type { Bucket } from "@/shared/types";
import "leaflet/dist/leaflet.css";

type Feature = { properties: { name: string }; geometry: unknown };

/** Country name -> [lat, lng], from the same topology the flat map draws. */
function useCentroids() {
  return useMemo(() => {
    const fc = feature(topo as any, (topo as any).objects.countries) as unknown as {
      features: Feature[];
    };
    const m = new Map<string, [number, number]>();
    for (const f of fc.features) {
      const [lng, lat] = geoCentroid(f as any);
      if (Number.isFinite(lat) && Number.isFinite(lng)) m.set(f.properties.name, [lat, lng]);
    }
    return m;
  }, []);
}

/** Matches the flat map's 800x380 viewBox so both views occupy the same box. */
const ASPECT = 800 / 380;

export function SatelliteMap({ countries }: { countries: Bucket[] }) {
  const centroids = useCentroids();

  // Radius scales with share of traffic, on a log curve so one dominant
  // country doesn't shrink everyone else to a dot.
  const points = useMemo(() => {
    const max = Math.max(1, ...countries.map((c) => c.count));
    return countries
      .map((c) => {
        const name = countryName(c.key);
        const pos = name ? centroids.get(name) : undefined;
        if (!pos || !name) return null;
        const t = Math.log(c.count + 1) / Math.log(max + 1);
        return { name, count: c.count, pos, radius: 5 + t * 18 };
      })
      .filter(Boolean) as { name: string; count: number; pos: [number, number]; radius: number }[];
  }, [countries, centroids]);

  // The card is wide and short, so the zoom that fills it is driven by width.
  // Compute it from the container and make that the floor, otherwise Leaflet
  // zooms out past the tile set and Esri serves "no data" placeholders.
  const onMapReady = useCallback((map: LeafletMap | null) => {
    if (!map) return;
    const fit = () => {
      const width = map.getSize().x;
      if (!width) return;
      // Web Mercator: one world is 256px at zoom 0.
      const z = Math.log2(width / 256);
      map.setMinZoom(z);
      map.setZoom(Math.max(map.getZoom(), z), { animate: false });
    };
    fit();
    map.on("resize", fit);
  }, []);

  return (
    <div className="satellite-map" style={{ aspectRatio: ASPECT }}>
      <MapContainer
        center={[25, 0]}
        zoom={2}
        maxZoom={8}
        scrollWheelZoom
        zoomSnap={0.25}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        ref={onMapReady}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
        />
        {points.map((p) => (
          <CircleMarker
            key={p.name}
            center={p.pos}
            radius={p.radius}
            pathOptions={{
              color: "var(--accent)",
              fillColor: "var(--accent)",
              fillOpacity: 0.45,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              {`${p.name}: ${p.count.toLocaleString()}`}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
