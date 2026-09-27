import { Skeleton } from "@mantine/core";
import classes from "./skeleton.module.css";
import layout from "./searchConsole.module.css";
import metrics from "./metrics.module.css";
import insights from "./insights.module.css";
import detail from "./pageDetail.module.css";
import picker from "./picker.module.css";

const LABEL_WIDTHS = ["62%", "48%", "71%", "55%", "40%", "66%", "52%", "44%", "58%", "37%"];

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export function StatTileSkeleton({ spark = true }: { spark?: boolean }) {
  return (
    <div className="stat-card">
      <div className={classes.stat}>
        <div className={classes.statHead}>
          <div className={classes.inline}>
            <Skeleton height={14} width={14} radius="sm" />
            <Skeleton height={10} width={90} radius="sm" />
          </div>
          <Skeleton height={20} width={52} radius="xl" />
        </div>
        <Skeleton height={28} width="45%" radius="sm" />
        {spark && <Skeleton height={34} radius="sm" className={classes.spark} />}
      </div>
    </div>
  );
}

export function StatTilesSkeleton({ twoColumns = false }: { twoColumns?: boolean }) {
  return (
    <div className={`${metrics.tiles} ${twoColumns ? metrics.twoColumns : ""}`}>
      {range(4).map((i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  );
}

function CardHeadSkeleton({ action }: { action?: "button" | "search" }) {
  return (
    <div className={layout.cardHead}>
      <div>
        <Skeleton height={13} width={140} radius="sm" />
        <Skeleton height={10} width={260} mt={8} radius="sm" />
      </div>
      {action === "button" && <Skeleton height={24} width={76} radius="sm" />}
      {action === "search" && <Skeleton height={36} width={260} radius="sm" />}
    </div>
  );
}

function TableRowsSkeleton({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className={classes.rows}>
      {range(rows).map((i) => (
        <div key={i} className={classes.row}>
          <Skeleton height={10} width={14} radius="sm" />
          <div className={classes.grow}>
            <Skeleton height={11} width={LABEL_WIDTHS[i % LABEL_WIDTHS.length]} radius="sm" />
          </div>
          <div className={classes.nums}>
            {range(columns).map((c) => (
              <Skeleton key={c} height={11} width={c === columns - 1 ? 38 : 44} radius="xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableCardSkeleton({
  rows = 5,
  columns = 3,
  action,
  pagination = false,
}: {
  rows?: number;
  columns?: number;
  action?: "button" | "search";
  pagination?: boolean;
}) {
  return (
    <div className={layout.card}>
      <CardHeadSkeleton action={action} />
      <TableRowsSkeleton rows={rows} columns={columns} />
      {pagination && (
        <div className={classes.footer}>
          <div className={classes.inline}>
            <Skeleton height={10} width={90} radius="sm" />
            <Skeleton height={30} width={84} radius="sm" />
          </div>
          <Skeleton height={30} width={180} radius="sm" />
        </div>
      )}
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className={layout.card}>
      <CardHeadSkeleton />
      <Skeleton height={300} radius="md" />
    </div>
  );
}

function LookupSkeleton() {
  return (
    <div className={classes.lookup}>
      <div className={classes.inline}>
        <Skeleton height={38} width={38} radius="md" />
        <div>
          <Skeleton height={12} width={110} radius="sm" />
          <Skeleton height={10} width={260} mt={8} radius="sm" />
        </div>
      </div>
      <div className={classes.lookupForm}>
        <Skeleton height={36} radius="sm" />
        <Skeleton height={36} width={110} radius="sm" />
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div className={layout.section}>
      <LookupSkeleton />
      <StatTilesSkeleton />
      <ChartCardSkeleton />
      <div className={layout.tables}>
        <TableCardSkeleton rows={6} columns={4} action="button" />
        <TableCardSkeleton rows={6} columns={4} action="button" />
      </div>
    </div>
  );
}

export function BreakdownSkeleton({ columns = 5 }: { columns?: number }) {
  return <TableCardSkeleton rows={10} columns={columns} action="search" pagination />;
}

function InsightCardSkeleton() {
  return (
    <div className={insights.card}>
      <div className={classes.insightHead}>
        <Skeleton height={32} width={32} radius="md" />
        <div className={classes.grow}>
          <Skeleton height={12} width="40%" radius="sm" />
          <Skeleton height={10} width="75%" mt={8} radius="sm" />
        </div>
        <Skeleton height={20} width={28} radius="xl" />
      </div>
      <div className={classes.insightRows}>
        <TableRowsSkeleton rows={5} columns={2} />
      </div>
      <div className={classes.insightFoot}>
        <Skeleton height={22} width={120} radius="sm" />
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className={insights.root}>
      <Skeleton height={12} width={420} maw="100%" radius="sm" />
      <div className={insights.summary}>
        {range(3).map((i) => (
          <StatTileSkeleton key={i} spark={false} />
        ))}
      </div>
      <div className={insights.grid}>
        {range(4).map((i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DevicesSkeleton() {
  return (
    <div className={layout.deviceGrid}>
      {range(3).map((i) => (
        <div key={i} className={layout.card}>
          <div className={classes.inline}>
            <Skeleton height={36} width={36} radius="md" />
            <div>
              <Skeleton height={12} width={80} radius="sm" />
              <Skeleton height={10} width={64} mt={8} radius="sm" />
            </div>
          </div>
          <Skeleton height={8} mt="md" radius="xl" />
          <div className={layout.deviceStats}>
            {range(4).map((s) => (
              <div key={s}>
                <Skeleton height={10} width={60} radius="sm" />
                <Skeleton height={18} width={50} mt={8} radius="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SitemapsSkeleton() {
  return <TableCardSkeleton rows={3} columns={4} action="button" />;
}

export function ConsoleSkeleton() {
  return (
    <div className={layout.page}>
      <div className={classes.toolbar}>
        <div className={classes.inline}>
          <Skeleton height={36} width={36} radius="md" />
          <div>
            <Skeleton height={13} width={160} radius="sm" />
            <Skeleton height={10} width={280} mt={8} radius="sm" />
          </div>
        </div>
        <div className={classes.controls}>
          <Skeleton height={36} width={104} radius="sm" />
          <Skeleton height={36} width={180} radius="sm" />
          <Skeleton height={36} width={36} radius="sm" />
          <Skeleton height={36} width={36} radius="sm" />
        </div>
      </div>
      <div className={classes.tabs}>
        {[76, 70, 66, 56, 84, 70, 76].map((w, i) => (
          <Skeleton key={i} height={14} width={w} radius="sm" />
        ))}
      </div>
      <OverviewSkeleton />
    </div>
  );
}

export function PropertyPickerSkeleton() {
  return (
    <div className={picker.wrap}>
      <div className={classes.inline}>
        <Skeleton height={20} width={130} radius="xl" />
        <Skeleton height={1} width={40} />
        <Skeleton height={20} width={110} radius="xl" />
      </div>
      <div className={picker.panel}>
        <Skeleton height={30} width={240} radius="xl" />
        <div>
          <Skeleton height={20} width="70%" radius="sm" />
          <Skeleton height={11} width="85%" mt={10} radius="sm" />
        </div>
        <div className={classes.stack}>
          {range(1).map((i) => (
            <div key={i} className={classes.option}>
              <Skeleton height={34} width={34} radius="md" />
              <div className={classes.grow}>
                <Skeleton height={12} width="40%" radius="sm" />
                <Skeleton height={10} width="60%" mt={8} radius="sm" />
              </div>
              <Skeleton height={18} width={18} radius="xl" />
            </div>
          ))}
        </div>
        <Skeleton height={10} width={260} radius="sm" />
        <Skeleton height={42} radius="sm" />
      </div>
      <Skeleton height={10} width={220} radius="sm" />
    </div>
  );
}

export function IndexStatusSkeleton() {
  return (
    <div className={detail.status}>
      <div className={classes.inline}>
        <Skeleton height={20} width={20} radius="xl" />
        <div className={classes.grow}>
          <Skeleton height={14} width="60%" radius="sm" />
          <Skeleton height={10} width="45%" mt={8} radius="sm" />
        </div>
      </div>
      <div className={detail.facts}>
        {range(4).map((i) => (
          <div key={i}>
            <Skeleton height={9} width={70} radius="sm" />
            <Skeleton height={12} width={LABEL_WIDTHS[i]} mt={6} radius="sm" />
          </div>
        ))}
      </div>
      <Skeleton height={10} width={140} radius="sm" />
    </div>
  );
}

export function PageDetailMainSkeleton() {
  return (
    <>
      <StatTilesSkeleton />
      <ChartCardSkeleton />
    </>
  );
}

export function DrawerSkeleton() {
  return (
    <div className={classes.stack}>
      <StatTilesSkeleton twoColumns />
      <Skeleton height={260} radius="md" />
      <TableCardSkeleton rows={5} columns={4} />
    </div>
  );
}
