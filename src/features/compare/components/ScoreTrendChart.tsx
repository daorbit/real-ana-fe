import { useMemo } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeoCompetitorComparison, SeoCompetitorHistoryPoint } from "@/shared/types";
import { BASELINE_ID } from "../lib/trust";
import { MAX_SERIES, chartDate, chartInk, seriesPalette, trendDomain, trendRows, youColor } from "../lib/trend";
import { TodayStanding } from "./trend/TodayStanding";
import { TrendLegend } from "./trend/TrendLegend";
import { TrendTooltip } from "./trend/TrendTooltip";
import classes from "./trend/Trend.module.css";

export function ScoreTrendChart({
  history,
  competitors,
  myScore,
  selectedId,
  onSelect,
}: {
  history: SeoCompetitorHistoryPoint[];
  competitors: SeoCompetitorComparison[];
  myScore: number;
  selectedId: string | null;
  onSelect: (competitorId: string) => void;
}) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const palette = seriesPalette(dark);
  const you = youColor(dark);
  const { axis, grid } = chartInk(dark);

  const readable = competitors.filter((c) => !c.readIssue);
  const plotted = readable.slice(0, MAX_SERIES);
  const omitted = readable.slice(MAX_SERIES);
  const hasMyLine = history.some((p) => p.competitorId === BASELINE_ID && p.statusCode < 400);
  const focused = plotted.some((c) => c.competitorId === selectedId) ? selectedId : null;

  const rows = useMemo(() => trendRows(history), [history]);
  const domain = useMemo(() => trendDomain(rows, myScore), [rows, myScore]);
  const names = useMemo(
    () => new Map([[BASELINE_ID, "Your page"], ...plotted.map((c): [string, string] => [c.competitorId, c.label])]),
    [plotted],
  );

  const trending = rows.length >= 2;

  return (
    <section className={`${classes.card} tone-tile`} data-tone="indigo">
      <div className={classes.head}>
        <div>
          <h3 className={classes.title}>{trending ? "Score over time" : "Where everyone stands today"}</h3>
          <p className={classes.sub}>
            {trending
              ? "On-page score at each check. Yours is the dashed line. Click a name to compare."
              : "On-page score out of 100. After checks on two different days, this becomes a trend line."}
          </p>
        </div>
      </div>

      {trending ? (
        <>
          <div className={classes.plot}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={chartDate}
                  tick={{ fill: axis, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                  tickMargin={8}
                />
                <YAxis
                  domain={domain}
                  tick={{ fill: axis, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: grid, strokeWidth: 1 }}
                  content={(p) => <TrendTooltip active={p.active} payload={p.payload} label={p.label} names={names} />}
                />
                {plotted.map((c, i) => {
                  const dim = focused !== null && focused !== c.competitorId;
                  return (
                    <Line
                      key={c.competitorId}
                      type="monotone"
                      dataKey={c.competitorId}
                      stroke={palette[i]}
                      strokeWidth={focused === c.competitorId ? 3 : 2}
                      strokeOpacity={dim ? 0.28 : 1}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  );
                })}
                {hasMyLine && (
                  <Line
                    type="monotone"
                    dataKey={BASELINE_ID}
                    stroke={you}
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <TrendLegend
            series={plotted}
            palette={palette}
            you={hasMyLine ? you : null}
            selectedId={focused}
            onSelect={onSelect}
          />
        </>
      ) : (
        <TodayStanding
          competitors={plotted}
          palette={palette}
          you={you}
          myScore={myScore}
          selectedId={focused}
          onSelect={onSelect}
        />
      )}

      {omitted.length > 0 && (
        <p className={classes.omitted}>
          Not plotted: {omitted.map((c) => c.label).join(", ")}. Up to {MAX_SERIES} competitors are drawn so no two share a
          colour.
        </p>
      )}
    </section>
  );
}
