import { Box, Loader, Text } from "@mantine/core";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { compact } from "@/shared/lib/format";
import type { ApiKeyUsageWindow } from "@/shared/types";
import type { UsagePoint } from "../../hooks/useKeyUsage";
import { UsageTooltip } from "./UsageTooltip";
import classes from "./Developers.module.css";

const AXIS_TICK = { fill: "var(--text-2)", fontSize: 11 };

interface Props {
  points: UsagePoint[];
  windowDays: ApiKeyUsageWindow;
  loading: boolean;
}

export function UsageChart({ points, windowDays, loading }: Props) {
  const { t } = useTranslation();
  const empty = points.every((p) => p.requests === 0);

  return (
    <Box className={classes.chart}>
      <div className={classes.chartHead}>
        <Text size="sm" fw={600}>
          {t("developers.chartTitle")}
        </Text>
        <div className={classes.legend}>
          <span className={classes.legendItem}>
            <span className={classes.legendDot} data-series="successful" />
            {t("developers.chartSuccessful")}
          </span>
          <span className={classes.legendItem}>
            <span className={classes.legendDot} data-series="failed" />
            {t("developers.chartFailed")}
          </span>
        </div>
      </div>

      <div className={classes.chartBody} data-loading={loading || undefined}>
        {loading && (
          <div className={classes.chartOverlay}>
            <Loader size="sm" />
          </div>
        )}
        {empty && !loading && (
          <div className={classes.chartOverlay}>
            <Text size="sm" fw={600}>
              {t("developers.usageEmpty", { count: windowDays })}
            </Text>
            <Text size="xs" c="dimmed">
              {t("developers.usageEmptyBody")}
            </Text>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart
            data={points}
            margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
            barCategoryGap={windowDays > 30 ? "14%" : "26%"}
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
              tickFormatter={compact}
            />
            <Tooltip cursor={{ fill: "var(--surface-2)" }} content={<UsageTooltip />} isAnimationActive={false} />
            <Bar dataKey="successful" stackId="usage" fill="var(--accent)" radius={[2, 2, 0, 0]} animationDuration={500} />
            <Bar dataKey="failures" stackId="usage" fill="var(--mantine-color-red-6)" radius={[2, 2, 0, 0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Box>
  );
}
