import { useEffect, useState } from "react";
import { Alert, Anchor, Drawer, ScrollArea, Skeleton, Stack, Table, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import { METRICS, metricChange, pagePath, type MetricKey } from "../searchMetrics";
import { renderPage, renderQuery } from "../searchConsoleTabs";
import { SearchPerformanceChart } from "./SearchPerformanceChart";
import classes from "./searchConsole.module.css";

export type DrillTarget = { dimension: "query" | "page"; value: string };

export function SearchDrilldownDrawer({
  target,
  onClose,
  onOpen,
  workspaceId,
  siteId,
  days,
  type,
}: {
  target: DrillTarget | null;
  onClose: () => void;
  onOpen: (target: DrillTarget) => void;
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
}) {
  const phone = useMediaQuery("(max-width: 48em)") ?? false;
  const [metricKey, setMetricKey] = useState<MetricKey>("clicks");
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  useEffect(() => setMetricKey("clicks"), [target?.value]);

  const { data, isFetching, error } = useGetSearchDrilldownQuery(
    { workspaceId, siteId, days, type, dimension: target?.dimension ?? "query", value: target?.value ?? "" },
    { skip: !target },
  );

  const isQuery = target?.dimension === "query";
  const fresh = data && target && data.value === target.value && data.dimension === target.dimension;

  return (
    <Drawer
      opened={Boolean(target)}
      onClose={onClose}
      position={phone ? "bottom" : "right"}
      size={phone ? "90%" : 620}
      radius={phone ? "lg" : 0}
      title={
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {isQuery ? "Query" : "Page"}
          </Text>
          <Text fw={650} size="md" className={classes.drawerValue}>
            {isQuery ? target?.value : target ? pagePath(target.value) : ""}
          </Text>
          {!isQuery && target && (
            <Anchor href={target.value} target="_blank" rel="noopener noreferrer" size="xs">
              Open page <ExternalLink size={11} />
            </Anchor>
          )}
        </div>
      }
    >
      {error && !fresh ? (
        <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
          {errMessage(error, "Could not load details from Google.")}
        </Alert>
      ) : !fresh || isFetching ? (
        <Stack gap="md">
          <Skeleton height={70} radius="md" />
          <Skeleton height={220} radius="md" />
          <Skeleton height={200} radius="md" />
        </Stack>
      ) : (
        <Stack gap="lg">
          <div className={classes.drawerTiles}>
            {METRICS.map((m) => {
              const change = metricChange(m, data.totals[m.key], data.previous?.[m.key]);
              return (
                <button
                  key={m.key}
                  type="button"
                  className={classes.tile}
                  data-active={m.key === metricKey || undefined}
                  aria-pressed={m.key === metricKey}
                  onClick={() => setMetricKey(m.key)}
                >
                  <span className={classes.tileLabel}>{m.label}</span>
                  <span className={classes.tileValue}>{m.format(data.totals[m.key])}</span>
                  {change && (
                    <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
                      {change.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {data.daily.length > 1 ? (
            <SearchPerformanceChart daily={data.daily} metric={metric} />
          ) : (
            <Text size="sm" c="dimmed">
              Not enough daily data to chart yet.
            </Text>
          )}

          <div>
            <Text fw={650} size="sm">
              {isQuery ? "Pages ranking for this query" : "Queries bringing people to this page"}
            </Text>
            <Text size="xs" c="dimmed" mt={2} mb="sm">
              Click one to see its own details.
            </Text>
            {data.related.length === 0 ? (
              <Text size="sm" c="dimmed">
                Nothing recorded for this period.
              </Text>
            ) : (
              <ScrollArea>
                <Table verticalSpacing={8} fz="xs" className={classes.table} highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{isQuery ? "Page" : "Query"}</Table.Th>
                      {METRICS.map((m) => (
                        <Table.Th key={m.key} className={classes.numCell}>
                          {m.key === "position" ? "Pos." : m.label}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data.related.map((row, i) => (
                      <Table.Tr
                        key={`${row.key}-${i}`}
                        className={classes.clickableRow}
                        onClick={() => onOpen({ dimension: isQuery ? "page" : "query", value: row.key })}
                      >
                        <Table.Td className={classes.labelCell} title={row.key}>
                          {isQuery ? renderPage(row) : renderQuery(row)}
                        </Table.Td>
                        {METRICS.map((m) => (
                          <Table.Td key={m.key} className={classes.numCell}>
                            {m.format(row[m.key])}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </Stack>
      )}
    </Drawer>
  );
}
