import { useMemo, useState } from "react";
import { Center, SegmentedControl } from "@mantine/core";
import { CircleDot, Map as MapIcon, MapPinned, Satellite } from "lucide-react";
import { RankCard } from "@/shared/ui/rank/RankCard";
import { SatelliteMap } from "@/shared/ui/SatelliteMap";
import { countryName } from "@/shared/lib";
import type { Bucket } from "@/shared/types";
import { FlatWorldMap } from "@/shared/ui/worldMap/FlatWorldMap";
import { BubbleWorldMap } from "@/shared/ui/worldMap/BubbleWorldMap";

type MapView = "bubbles" | "flat" | "basic" | "satellite";

const VIEWS: MapView[] = ["bubbles", "flat", "basic", "satellite"];

const readView = (): MapView => {
  try {
    const saved = localStorage.getItem("worldmap:view") as MapView | null;
    return saved && VIEWS.includes(saved) ? saved : "bubbles";
  } catch {
    return "bubbles";
  }
};

const VIEW_OPTIONS = [
  { value: "bubbles", icon: CircleDot, label: "Bubble map" },
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
  onSelect,
}: {
  countries: Bucket[];
  liveCountries?: Bucket[];
  onSelect?: (code: string) => void;
}) {
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null);
  const [view, setView] = useState<MapView>(readView);
  const [range, setRange] = useState<"24h" | "live">("24h");

  const setViewPersisted = (v: string) => {
    setView(v as MapView);
    try {
      localStorage.setItem("worldmap:view", v);
    } catch {
      return;
    }
  };

  const activeCountries = range === "live" ? liveCountries ?? [] : countries;

  const byName = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of activeCountries) {
      const name = countryName(c.key);
      if (name) m.set(name, (m.get(name) ?? 0) + c.count);
    }
    return m;
  }, [activeCountries]);

  const subtitle =
    view !== "satellite" && hover && hover.count > 0
      ? `${hover.name} · ${hover.count.toLocaleString()}`
      : range === "live"
        ? `${activeCountries.reduce((s, c) => s + c.count, 0).toLocaleString()} online now`
        : "Top countries in this period";

  return (
    <RankCard
      title="Visitors by country"
      tone="blue"
      subtitle={subtitle}
      actions={
        <>
          {liveCountries && (
            <SegmentedControl
              size="xs"
              value={range}
              onChange={(v) => setRange(v as "24h" | "live")}
              data={[
                { value: "24h", label: "This period" },
                { value: "live", label: "Live now" },
              ]}
            />
          )}
          <SegmentedControl
            size="xs"
            className="map-view-switch"
            value={view}
            onChange={setViewPersisted}
            data={VIEW_OPTIONS}
          />
        </>
      }
    >
      {view === "satellite" ? (
        <SatelliteMap countries={activeCountries} />
      ) : view === "bubbles" ? (
        <BubbleWorldMap byName={byName} onHover={setHover} onSelect={onSelect} />
      ) : (
        <FlatWorldMap byName={byName} spotlight={view === "flat"} onHover={setHover} />
      )}
    </RankCard>
  );
}
