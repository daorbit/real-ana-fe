import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { DonutBreakdown } from "@/shared/ui/rank/DonutBreakdown";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { countryLabel } from "@/shared/lib";
import { BIO_DEVICE_LABEL, BIO_SOURCE_LABEL } from "@/features/bio/lib/bioSource";
import type { BioPageInput, BioPageStatsDetail, BioStatRow } from "@/features/bio/types";
import type { ChartItem } from "./chartPalette";
import { ColumnChart } from "./ColumnChart";
import { Masonry, MasonryItem } from "./Masonry";
import { RadialChart } from "./RadialChart";
import classes from "./BioStats.module.css";

let languageNames: Intl.DisplayNames | null = null;

function languageLabel(code: string): string {
  try {
    languageNames ??= new Intl.DisplayNames(["en"], { type: "language" });
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function cityName(key: string): string {
  return key.includes(":") ? key.split(":")[1] : key;
}

function toItems(list: BioStatRow[], label: (key: string) => string): ChartItem[] {
  return list.map((r) => ({ id: r.key, label: label(r.key), value: r.count }));
}

function Widget({ title, subtitle, empty, children }: { title: string; subtitle: string; empty: boolean; children: ReactNode }) {
  return (
    <MasonryItem>
      <RankCard title={title} subtitle={subtitle} tone="blue" fill={false}>
        {empty ? <RankEmpty icon={Inbox}>Nothing yet for this period.</RankEmpty> : children}
      </RankCard>
    </MasonryItem>
  );
}

function Donut({ list, label, totalLabel = "Views" }: { list: BioStatRow[]; label: (key: string) => ReactNode; totalLabel?: string }) {
  return <DonutBreakdown totalLabel={totalLabel} items={list.map((r) => ({ id: r.key, label: label(r.key), value: r.count }))} />;
}

export function BioBreakdowns({ stats, page }: { stats: BioPageStatsDetail; page: BioPageInput }) {
  const release = page.kind === "release";
  const linkItems: ChartItem[] = stats.links.map((link) => ({
    id: link.id,
    label: link.label || "Untitled",
    value: link.clicks,
    note: stats.views ? `${((link.clicks / stats.views) * 100).toFixed(1)}%` : undefined,
  }));

  return (
    <Masonry>
      <Widget title={release ? "Clicks by service" : "Clicks by link"} subtitle="Which buttons people tap. Hover a bar for its click-through." empty={!linkItems.length}>
        <ColumnChart items={linkItems} />
      </Widget>

      <Widget title="Sources" subtitle="Where visitors came from" empty={!stats.sources.length}>
        <Donut list={stats.sources} label={(key) => BIO_SOURCE_LABEL[key] ?? key} />
      </Widget>

      <Widget title="Countries" subtitle="Where visitors are" empty={!stats.countries.length}>
        <Donut
          list={stats.countries}
          label={(key) => (
            <span className={classes.flagLabel}>
              <CountryFlag code={key} size={12} />
              {countryLabel(key)}
            </span>
          )}
        />
      </Widget>

      <Widget title="Referrers" subtitle="Sites that sent the visit" empty={!stats.referrers.length}>
        <RadialChart items={toItems(stats.referrers, (key) => key)} />
      </Widget>

      <Widget title="Devices" subtitle="What they opened it on" empty={!stats.devices.length}>
        <Donut list={stats.devices} label={(key) => BIO_DEVICE_LABEL[key] ?? key} />
      </Widget>

      <Widget title="Top cities" subtitle="Views by city" empty={!stats.cities.length}>
        <ColumnChart items={toItems(stats.cities, cityName)} limit={7} />
      </Widget>

      <Widget title="Campaigns" subtitle="From utm_campaign on tracked links" empty={!stats.campaigns.length}>
        <Donut list={stats.campaigns} label={(key) => key} />
      </Widget>

      <Widget title="Browsers" subtitle="Including in-app browsers" empty={!stats.browsers.length}>
        <RadialChart items={toItems(stats.browsers, (key) => key)} />
      </Widget>

      <Widget title="Operating systems" subtitle="Phone and computer systems" empty={!stats.os.length}>
        <Donut list={stats.os} label={(key) => key} />
      </Widget>

      <Widget title="Languages" subtitle="From the visitor's browser" empty={!stats.languages.length}>
        <RadialChart items={toItems(stats.languages, languageLabel)} />
      </Widget>
    </Masonry>
  );
}
