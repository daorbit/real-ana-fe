import type { ReactNode } from "react";
import { Bone } from "./SkeletonBone";
import classes from "./skeleton.module.css";
import layout from "./searchConsole.module.css";
import metrics from "./metrics.module.css";
import insights from "./insights.module.css";
import detail from "./pageDetail.module.css";
import picker from "./picker.module.css";
import devices from "./devices.module.css";
import sitemaps from "./sitemaps.module.css";

const LABEL_WIDTHS = ["62%", "48%", "71%", "55%", "40%", "66%", "52%", "44%", "58%", "37%"];
const HOUR_HEIGHTS = [22, 14, 10, 10, 14, 12, 9, 13, 13, 9, 12, 14, 9, 10, 30, 40, 52, 72, 76, 72, 76, 70, 52, 40, 36, 12, 10, 16, 14, 10, 14, 15, 10, 12, 16, 12, 11, 16, 30, 42, 70, 80, 78, 86, 90, 74, 64, 58];
const TRACE = "M0 62 L8 50 L16 56 L25 58 L33 70 L41 78 L50 52 L58 44 L66 52 L75 40 L83 30 L91 38 L100 26";

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function Loading({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`${classes.loading} ${className ?? ""}`} role="status" aria-label={label} aria-busy>
      {children}
    </div>
  );
}

function CardHead({ title = 140, desc = 280, right }: { title?: number; desc?: number; right?: ReactNode }) {
  return (
    <div className={layout.cardHead}>
      <div className={classes.stack}>
        <Bone w={title} h={13} strong />
        <Bone w={desc} h={10} />
      </div>
      {right}
    </div>
  );
}

function GroupHead({ large = false, right }: { large?: boolean; right?: ReactNode }) {
  return (
    <div className={layout.groupHead}>
      <div className={classes.stack}>
        <Bone w={large ? 160 : 120} h={large ? 18 : 13} strong />
        <Bone w={large ? 320 : 240} h={10} />
      </div>
      {right}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className={classes.tile}>
      <div className={classes.inline}>
        <Bone w={8} h={8} shape="circle" strong />
        <Bone w={84} h={10} />
      </div>
      <Bone w="46%" h={22} shape="block" strong />
      <Bone w="62%" h={9} />
      <Bone h={26} shape="tile" />
    </div>
  );
}

export function StatTilesSkeleton({ columns = 4 }: { columns?: 2 | 4 | 5 }) {
  return (
    <div className={metrics.tiles} data-columns={columns}>
      {range(columns).map((i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  );
}

function ChartArea({ size }: { size?: "sm" }) {
  return (
    <div className={classes.chartArea} data-size={size}>
      {range(4).map((i) => (
        <span key={i} className={classes.gridLine} />
      ))}
      <svg className={classes.chartTrace} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d={TRACE} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={classes.chartTicks}>
        {range(5).map((i) => (
          <Bone key={i} w={38} h={9} />
        ))}
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className={layout.card}>
      <CardHead title={160} desc={360} right={<Bone w={150} h={10} />} />
      <ChartArea />
    </div>
  );
}

function HourlySkeleton() {
  return (
    <div className={layout.card}>
      <CardHead title={110} desc={420} right={<Bone w={150} h={26} shape="block" />} />
      <div className={classes.spread}>
        <div className={classes.inline}>
          {range(2).map((i) => (
            <div key={i} className={classes.stackTight}>
              <Bone w={96} h={9} />
              <Bone w={70} h={18} shape="block" strong />
            </div>
          ))}
        </div>
        <Bone w={150} h={10} />
      </div>
      <div className={classes.bars}>
        {HOUR_HEIGHTS.map((h, i) => (
          <Bone key={i} w="auto" h={`${h}%`} shape="tile" className={classes.bar} />
        ))}
      </div>
    </div>
  );
}

function ListRows({ rows, cells, rank = false, tall = false }: { rows: number; cells: number[]; rank?: boolean; tall?: boolean }) {
  return (
    <>
      {range(rows).map((i) => (
        <div key={i} className={classes.listRow} data-tall={tall || undefined}>
          {rank && <Bone w={14} h={10} />}
          <div className={classes.grow}>
            {tall ? (
              <div className={classes.stack}>
                <Bone w={LABEL_WIDTHS[i % LABEL_WIDTHS.length]} h={12} strong />
                <Bone w="82%" h={10} />
              </div>
            ) : (
              <Bone w={LABEL_WIDTHS[i % LABEL_WIDTHS.length]} h={11} strong />
            )}
          </div>
          <div className={classes.cells}>
            {cells.map((w, c) => (
              <Bone key={c} w={w} h={c === cells.length - 1 ? 20 : 11} shape={c === cells.length - 1 ? "block" : "line"} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ListHead({ cells, rank = false }: { cells: number[]; rank?: boolean }) {
  return (
    <div className={classes.listHead}>
      {rank && <Bone w={10} h={9} />}
      <div className={classes.grow}>
        <Bone w={54} h={9} />
      </div>
      <div className={classes.cells}>
        {cells.map((w, c) => (
          <Bone key={c} w={Math.max(34, w - 6)} h={9} />
        ))}
      </div>
    </div>
  );
}

export function TableCardSkeleton({ rows = 6, columns = 3 }: { rows?: number; columns?: number }) {
  const cells = range(columns).map((c) => (c === 0 ? 80 : c === columns - 1 ? 38 : 48));
  return (
    <div className={layout.group}>
      <GroupHead right={<Bone w={52} h={10} />} />
      <div className={layout.listCard}>
        <ListHead cells={cells} />
        <ListRows rows={rows} cells={cells} />
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <Loading label="Loading search performance" className={layout.section}>
      <div className={layout.headline}>
        <div className={classes.stack}>
          <Bone w="68%" h={18} shape="block" strong />
          <Bone w="44%" h={11} />
        </div>
      </div>
      <StatTilesSkeleton />
      <ChartCardSkeleton />
      <HourlySkeleton />
      <div className={layout.tables}>
        <TableCardSkeleton rows={6} columns={3} />
        <TableCardSkeleton rows={6} columns={3} />
      </div>
    </Loading>
  );
}

export function BreakdownSkeleton({ showViews = false }: { labelHeader: string; showViews?: boolean }) {
  const cells = [150, 48, ...(showViews ? [48] : []), 70, 44, 40];
  return (
    <Loading label="Loading report" className={layout.group}>
      <GroupHead large right={<Bone w={280} h={36} shape="block" />} />
      <div className={layout.listCard}>
        <ListHead rank cells={cells} />
        <ListRows rank rows={10} cells={cells} />
      </div>
      <div className={`${classes.spread} ${layout.pagerRow}`}>
        <Bone w={96} h={10} />
        <div className={classes.inline}>
          <Bone w={78} h={26} shape="pill" />
          <Bone w={56} h={26} shape="pill" />
        </div>
      </div>
    </Loading>
  );
}

export function InsightsSkeleton() {
  return (
    <Loading label="Loading insights" className={insights.root}>
      <div className={insights.summary}>
        <div className={`${insights.summaryMain} ${classes.stack}`}>
          <Bone w={300} h={20} shape="block" strong />
          <Bone w={420} h={11} />
        </div>
        <div className={insights.kindCounts}>
          {[118, 96, 92].map((w, i) => (
            <Bone key={i} w={w} h={28} shape="block" />
          ))}
        </div>
      </div>

      <div className={insights.panel}>
        <CardHead title={170} desc={460} />
        <Bone h={10} shape="pill" />
        <div className={classes.bandGrid}>
          {range(4).map((i) => (
            <div key={i} className={classes.band}>
              <Bone w={90} h={10} />
              <Bone w={56} h={22} shape="block" strong />
              <Bone w={130} h={9} />
              <Bone w={80} h={9} />
            </div>
          ))}
        </div>
      </div>

      <div className={insights.layout}>
        <div className={insights.group}>
          <GroupHead right={<Bone w={320} h={30} shape="block" />} />
          <div className={insights.list}>
            {range(6).map((i) => (
              <div key={i} className={classes.listRow} data-tall>
                <Bone w={30} h={30} shape="block" />
                <div className={`${classes.grow} ${classes.stack}`}>
                  <Bone w={LABEL_WIDTHS[i]} h={12} strong />
                  <Bone w="84%" h={10} />
                </div>
                <Bone w={92} h={22} shape="block" />
              </div>
            ))}
          </div>
        </div>
        <div className={insights.side}>
          {range(2).map((p) => (
            <div key={p} className={insights.panel}>
              <CardHead title={p ? 160 : 120} desc={p ? 220 : 180} right={p ? undefined : <Bone w={120} h={24} shape="block" />} />
              {range(5).map((i) => (
                <div key={i} className={classes.factRow}>
                  <Bone w={LABEL_WIDTHS[(i + p) % LABEL_WIDTHS.length]} h={10} strong />
                  {!p && <Bone w={26} h={10} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

export function DevicesSkeleton() {
  return (
    <Loading label="Loading devices" className={devices.layout}>
      <div className={devices.card}>
        <CardHead title={120} desc={240} />
        <div className={classes.ring} aria-hidden>
          <Bone w={168} h={168} shape="circle" />
          <span className={classes.ringHole} />
        </div>
        <div>
          {range(3).map((i) => (
            <div key={i} className={classes.legendRow}>
              <Bone w={9} h={9} shape="tile" strong />
              <div className={classes.grow}>
                <Bone w={64} h={11} />
              </div>
              <Bone w={32} h={11} strong />
            </div>
          ))}
        </div>
      </div>
      <div className={devices.card}>
        <CardHead title={150} desc={380} />
        <div className={classes.metricGrid}>
          {range(4).map((m) => (
            <div key={m} className={classes.stack}>
              <Bone w={84} h={9} />
              {range(3).map((i) => (
                <div key={i} className={classes.barRow}>
                  <Bone w={46} h={10} />
                  <Bone w={`${92 - i * 34}%`} h={8} shape="pill" strong />
                  <Bone w={36} h={10} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

export function SitemapsSkeleton() {
  return (
    <Loading label="Loading sitemaps" className={sitemaps.root}>
      <div className={sitemaps.submitCard}>
        <div className={`${sitemaps.submitText} ${classes.stack}`}>
          <Bone w={110} h={13} strong />
          <Bone w={260} h={10} />
        </div>
        <div className={sitemaps.urlBar}>
          <Bone h={36} shape="block" />
          <Bone w={84} h={36} shape="pill" strong />
        </div>
      </div>
      <div className={sitemaps.listCard}>
        <div className={classes.listHead}>
          <div className={classes.grow}>
            <Bone w={120} h={9} />
          </div>
          <Bone w={110} h={9} />
        </div>
        {range(4).map((i) => (
          <div key={i} className={classes.listRow} data-tall>
            <Bone w={34} h={34} shape="block" />
            <div className={`${classes.grow} ${classes.stack}`}>
              <Bone w={LABEL_WIDTHS[i]} h={12} strong />
              <Bone w="58%" h={10} />
            </div>
            <Bone w={64} h={22} shape="block" />
            <Bone w={84} h={26} shape="pill" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function ConsoleSkeleton() {
  return (
    <Loading label="Loading Search visibility" className={layout.page}>
      <div className={layout.toolbar}>
        <div className={layout.headerText}>
          <Bone w={32} h={32} shape="block" />
          <div className={classes.stack}>
            <Bone w={170} h={13} strong />
            <Bone w={300} h={10} />
          </div>
        </div>
        <div className={classes.toolbarRight}>
          <Bone w={78} h={32} shape="block" />
          <Bone w={250} h={32} shape="block" />
          <Bone w={32} h={32} shape="circle" />
          <Bone w={32} h={32} shape="circle" />
        </div>
      </div>
      <div className={layout.tabHead}>
        <Bone w={520} h={32} shape="block" />
        <Bone w={420} h={11} />
      </div>
      <OverviewSkeleton />
    </Loading>
  );
}

export function PropertyPickerSkeleton() {
  return (
    <Loading label="Loading properties" className={picker.layout}>
      <div className={picker.intro}>
        <Bone w={140} h={12} />
        <Bone w={260} h={20} shape="pill" />
        <div className={classes.stack}>
          <Bone w="90%" h={26} shape="block" strong />
          <Bone w="60%" h={26} shape="block" strong />
          <Bone w="80%" h={12} />
        </div>
        <Bone h={58} shape="block" />
        <Bone h={110} shape="block" />
      </div>
      <div className={picker.panel}>
        <div className={picker.panelHead}>
          <div className={classes.stack}>
            <Bone w={200} h={13} strong />
            <Bone w={140} h={10} />
          </div>
          <Bone w={80} h={24} shape="block" />
        </div>
        <div className={picker.sections}>
          <div className={picker.grid}>
            {range(4).map((i) => (
              <div key={i} className={picker.tile}>
                <div className={picker.tileTop}>
                  <Bone w={40} h={40} shape="block" />
                  <Bone w={18} h={18} shape="circle" />
                </div>
                <div className={classes.stack}>
                  <Bone w="70%" h={12} strong />
                  <Bone w="55%" h={10} />
                  <Bone w={90} h={16} shape="pill" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={picker.panelFoot}>
          <Bone w={220} h={10} />
          <Bone w={160} h={40} shape="pill" strong />
        </div>
      </div>
    </Loading>
  );
}

export function IndexStatusSkeleton() {
  return (
    <Loading label="Checking index status" className={detail.status}>
      <div className={classes.inline}>
        <Bone w={36} h={36} shape="block" />
        <div className={`${classes.grow} ${classes.stack}`}>
          <Bone w="56%" h={14} strong />
          <Bone w="72%" h={10} />
        </div>
      </div>
      <div>
        {[128, 112, 72, 36, 56].map((w, i) => (
          <div key={i} className={classes.factRow}>
            <Bone w={76} h={10} />
            <Bone w={w} h={10} strong />
          </div>
        ))}
      </div>
      <Bone w={150} h={10} />
    </Loading>
  );
}

export function DrawerSkeleton() {
  return (
    <Loading label="Loading query" className={classes.stack}>
      <StatTilesSkeleton columns={4} />
      <div className={layout.card}>
        <ChartArea size="sm" />
      </div>
      <TableCardSkeleton rows={4} columns={3} />
    </Loading>
  );
}
