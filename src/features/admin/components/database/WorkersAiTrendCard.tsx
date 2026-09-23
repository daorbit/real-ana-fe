import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Box, Card, Center, Group, Loader, SegmentedControl, Text, useMantineColorScheme } from "@mantine/core";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from "recharts";
import { useGetWorkersAiTrendQuery } from "@/app/store";

export type WorkersAiTrendCardHandle = { refetch: () => void };

export const WorkersAiTrendCard = forwardRef<WorkersAiTrendCardHandle>(function WorkersAiTrendCard(_props, ref) {
  const [range, setRange] = useState<"today" | "7d">("today");
  const { data, isFetching, refetch } = useGetWorkersAiTrendQuery({ range });

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const axis = dark ? "#8b929e" : "#5f6673";
  const grid = dark ? "#2b2f38" : "#e9ecef";

  const rows = useMemo(
    () =>
      (data?.points ?? []).map((p) => ({
        ...p,
        label:
          range === "today"
            ? new Date(p.bucket).toLocaleTimeString(undefined, { hour: "numeric" })
            : new Date(p.bucket).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      })),
    [data, range],
  );

  return (
    <Card withBorder radius="lg" padding="xl">
      <Group justify="space-between" align="center" mb="md">
        <div>
          <Text fw={700} size="sm">Neurons over time</Text>
          <Text size="xs" c="dimmed">across every configured account</Text>
        </div>
        <SegmentedControl
          size="xs"
          value={range}
          onChange={(v) => setRange(v as "today" | "7d")}
          data={[
            { label: "Today", value: "today" },
            { label: "7 days", value: "7d" },
          ]}
        />
      </Group>

      <Box h={220} pos="relative">
        {isFetching && (
          <Center pos="absolute" inset={0} style={{ zIndex: 1 }}>
            <Loader size="sm" />
          </Center>
        )}
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: grid }}
              minTickGap={24}
            />
            <YAxis tick={{ fill: axis, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
            <ChartTooltip
              isAnimationActive={false}
              contentStyle={{
                background: dark ? "#1a1c22" : "#ffffff",
                border: `1px solid ${grid}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: axis, marginBottom: 4 }}
              formatter={(value) => {
                if (typeof value === "number") {
                  return [value.toFixed(1), "Neurons"];
                }
                return [value, "Requests"];
              }}
            />
            <Line
              type="monotone"
              dataKey="neurons"
              name="neurons"
              stroke="var(--mantine-color-emerald-6)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
});
