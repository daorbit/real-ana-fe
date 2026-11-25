import { useMemo } from "react";
import { ScrollArea, Table } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useGetSearchPageVitalsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useDemo } from "@/features/demo/context";
import { demoSearchPageVitals } from "@/features/demo/demoSearchVitals";
import { Pill } from "@/features/seo/components/shared/Pill";
import {
  VITALS, VITAL_RATING, formatVital, type VitalMeta, type VitalUnit,
} from "@/features/seo/components/panels/performance/vitalMeta";
import type { SearchPageVital, SearchVitalsDevice } from "@/shared/types";
import { METRIC_BY_KEY, pagePath } from "../../searchMetrics";
import { vitalsDeviceLabel } from "../../webVitals";
import { SearchSectionHead } from "../SearchSectionHead";
import { TableCardSkeleton } from "../SearchSkeletons";
import classes from "../searchConsole.module.css";

type CoreVital = Extract<VitalMeta, { key: "lcp" | "inp" | "cls" }>;

const COLUMNS = VITALS.filter((v): v is CoreVital => v.key === "lcp" || v.key === "inp" || v.key === "cls");

function VitalCell({ vital, unit }: { vital: SearchPageVital | null; unit: VitalUnit }) {
  if (!vital) return <span className={classes.mutedCell}>—</span>;
  return <Pill tone={VITAL_RATING[vital.rating].tone}>{formatVital(vital.p75, unit)}</Pill>;
}

function ResultCell({ passing }: { passing: boolean | null }) {
  if (passing === null) return <Pill>Not enough data</Pill>;
  return <Pill tone={passing ? "good" : "bad"}>{passing ? "Passing" : "Not passing"}</Pill>;
}

export function VitalPagesTable({
  workspaceId,
  siteId,
  device,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  device: SearchVitalsDevice;
  onOpenPage: (url: string) => void;
}) {
  const { demo } = useDemo();
  const real = useGetSearchPageVitalsQuery({ workspaceId, siteId, device }, { skip: demo });
  const sample = useMemo(() => (demo ? demoSearchPageVitals(device) : null), [demo, device]);
  const data = sample ?? real.currentData;

  if (!data) {
    return real.error && !real.isFetching ? (
      <ErrorState
        compact
        title="Couldn't load page vitals"
        description={errMessage(real.error, "Page vitals could not be loaded from Google.")}
        onRetry={real.refetch}
        retrying={real.isFetching}
      />
    ) : (
      <TableCardSkeleton />
    );
  }
  if (data.status !== "ready" || !data.pages.length) return null;

  return (
    <section className={classes.group}>
      <SearchSectionHead
        title="Your top pages"
        description={`Core Web Vitals for the pages with the most Google clicks, ${vitalsDeviceLabel(device)}. Google only reports pages with enough Chrome visits.`}
      />
      <div className={classes.listCard}>
        <ScrollArea className={classes.tableScroll}>
          <Table fz="xs" className={classes.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Page</Table.Th>
                <Table.Th className={classes.numCell}>Clicks</Table.Th>
                {COLUMNS.map((c) => (
                  <Table.Th key={c.key} className={classes.numCell} title={c.name}>
                    {c.label}
                  </Table.Th>
                ))}
                <Table.Th className={classes.numCell}>Result</Table.Th>
                <Table.Th className={classes.chevronCell} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.pages.map((page) => (
                <Table.Tr key={page.url} className={classes.clickableRow} onClick={() => onOpenPage(page.url)}>
                  <Table.Td className={classes.topLabelCell} title={page.url}>
                    {pagePath(page.url)}
                  </Table.Td>
                  <Table.Td className={`${classes.numCell} ${classes.mutedCell}`}>
                    {METRIC_BY_KEY.clicks.format(page.clicks)}
                  </Table.Td>
                  {COLUMNS.map((c) => (
                    <Table.Td key={c.key} className={classes.numCell}>
                      <VitalCell vital={page[c.key]} unit={c.unit} />
                    </Table.Td>
                  ))}
                  <Table.Td className={classes.numCell}>
                    <ResultCell passing={page.passing} />
                  </Table.Td>
                  <Table.Td className={classes.chevronCell}>
                    <ChevronRight size={14} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
    </section>
  );
}
