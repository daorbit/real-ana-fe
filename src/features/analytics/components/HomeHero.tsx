import { Box, Group } from "@mantine/core";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { num } from "@/shared/lib";
import type { LiveAudience, Point } from "@/shared/types";
import { AudienceSummary } from "./liveAudience/AudienceSummary";
import classes from "./HomeHero.module.css";

/**
 * The band at the top of Home.
 *
 * A dashboard should open with a number, not a greeting. This carries the one
 * hero figure for the view — visitors online right now — with the day's totals
 * as supporting context and the traffic shape behind it.
 *
 * Per the stat-tile spec there is exactly one hero figure per view, which is
 * why the cards below this band top out at 30px.
 */
export function HomeHero({
  workspaceName,
  live,
  audience,
  visitors,
  pageviews,
  series,
}: {
  workspaceName: string;
  live: number;
  audience: LiveAudience | null;
  visitors: number;
  pageviews: number;
  series: Point[];
}) {
  const hasShape = series.length > 1;
  const people = audience ? audience.humans : live;
  const unit = audience ? (people === 1 ? "person" : "people") : people === 1 ? "visitor" : "visitors";

  return (
    <Box className="hero-band" mb="xl">
      {hasShape && (
        <div className="hero-spark" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeOpacity={0.6}
                fill="var(--accent)"
                fillOpacity={0.06}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <Box className="hero-content hero-pad" p="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="xl">
          <div className={classes.lead}>
            <span className={classes.liveLabel}>
              <span className={`status-dot live ${classes.liveDot}`} />
              Online now
            </span>

            <div className={classes.figureRow}>
              <span className={`hero-figure ${classes.figure}`}>{num(people)}</span>
              <span className={classes.unit}>
                {unit} on {workspaceName}
              </span>
            </div>
            {audience && <AudienceSummary audience={audience} />}
          </div>

          <div className={classes.totals}>
            <div className={classes.total}>
              <div className={classes.totalLabel}>Visitors today</div>
              <div className={classes.totalValue}>{num(visitors)}</div>
            </div>
            <div className={classes.total}>
              <div className={classes.totalLabel}>Pageviews today</div>
              <div className={classes.totalValue}>{num(pageviews)}</div>
            </div>
            <div className={classes.total}>
              <div className={classes.totalLabel}>Period</div>
              <div className={classes.period}>Last 24 hours</div>
            </div>
          </div>
        </Group>
      </Box>
    </Box>
  );
}
