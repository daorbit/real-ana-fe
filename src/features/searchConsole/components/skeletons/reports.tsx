import { Bone } from "../SkeletonBone";
import classes from "../skeleton.module.css";
import layout from "../searchConsole.module.css";
import insights from "../insights.module.css";
import devices from "../devices.module.css";
import { CardHead, ChartArea, ChartCardSkeleton, GroupHead, HeadlineSkeleton, Loading, StatTilesSkeleton } from "./parts";
import { LABEL_WIDTHS, range } from "./shape";
import { TableCardSkeleton } from "./tables";

const HOUR_HEIGHTS = [
  22, 14, 10, 10, 14, 12, 9, 13, 13, 9, 12, 14, 9, 10, 30, 40, 52, 72, 76, 72, 76, 70, 52, 40, 36, 12, 10, 16, 14, 10,
  14, 15, 10, 12, 16, 12, 11, 16, 30, 42, 70, 80, 78, 86, 90, 74, 64, 58,
];

export function HourlyBodySkeleton() {
  return (
    <Loading label="Loading the last 48 hours" className={classes.stack}>
      <div className={classes.spread}>
        <div className={classes.statRow}>
          {range(2).map((i) => (
            <div key={i} className={classes.stackTight}>
              <Bone w={104} h={11} />
              <Bone w={72} h={20} shape="block" strong />
            </div>
          ))}
        </div>
        <Bone w={160} h={11} />
      </div>
      <div className={classes.bars}>
        {HOUR_HEIGHTS.map((h, i) => (
          <Bone key={i} w="auto" h={`${h}%`} shape="tile" strong={i >= 24} className={classes.bar} />
        ))}
      </div>
    </Loading>
  );
}

export function OverviewSkeleton() {
  return (
    <Loading label="Loading search performance" className={layout.section}>
      <HeadlineSkeleton />
      <StatTilesSkeleton />
      <ChartCardSkeleton />
      <div className={layout.card}>
        <CardHead title={120} desc={420} right={<Bone w={160} h={28} shape="block" />} />
        <HourlyBodySkeleton />
      </div>
      <div className={layout.tables}>
        <TableCardSkeleton />
        <TableCardSkeleton />
      </div>
    </Loading>
  );
}

function BandsSkeleton() {
  return (
    <div className={insights.panel}>
      <CardHead title={170} desc={460} />
      <Bone h={10} shape="pill" strong />
      <div className={classes.bandGrid}>
        {range(4).map((i) => (
          <div key={i} className={classes.band}>
            <Bone w={92} h={11} />
            <Bone w={56} h={24} shape="block" strong />
            <Bone w={130} h={10} />
            <Bone w={84} h={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <Loading label="Loading insights" className={insights.root}>
      <div className={insights.summary}>
        <div className={`${insights.summaryMain} ${classes.stack}`}>
          <Bone w={300} h={22} shape="block" strong />
          <Bone w={420} h={12} />
        </div>
        <div className={insights.kindCounts}>
          {[118, 96, 92].map((w) => (
            <Bone key={w} w={w} h={28} shape="pill" />
          ))}
        </div>
      </div>
      <BandsSkeleton />
      <div className={insights.layout}>
        <div className={insights.group}>
          <GroupHead right={<Bone w={320} h={32} shape="block" />} />
          <div className={insights.list}>
            {range(6).map((i) => (
              <div key={i} className={classes.listRow}>
                <Bone w={30} h={30} shape="block" strong />
                <div className={`${classes.grow} ${classes.stack}`}>
                  <Bone w={LABEL_WIDTHS[i]} h={13} strong />
                  <Bone w="84%" h={11} />
                </div>
                <Bone w={92} h={22} shape="pill" />
              </div>
            ))}
          </div>
        </div>
        <div className={insights.side}>
          {range(2).map((panel) => (
            <div key={panel} className={insights.panel}>
              <CardHead title={panel ? 160 : 120} desc={200} />
              {range(5).map((i) => (
                <div key={i} className={classes.factRow}>
                  <Bone w={LABEL_WIDTHS[(i + panel) % LABEL_WIDTHS.length]} h={12} strong />
                  <Bone w={30} h={12} />
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
        <CardHead title={120} desc={220} />
        <div className={classes.ring} aria-hidden>
          <Bone w={200} h={200} shape="circle" strong />
          <span className={classes.ringHole}>
            <Bone w={58} h={26} shape="block" strong />
            <Bone w={44} h={11} />
          </span>
        </div>
        {range(3).map((i) => (
          <div key={i} className={classes.legendRow}>
            <Bone w={10} h={10} shape="tile" strong />
            <div className={classes.grow}>
              <Bone w={68} h={12} />
            </div>
            <Bone w={36} h={12} strong />
          </div>
        ))}
      </div>
      <div className={devices.card}>
        <CardHead title={150} desc={360} />
        <div className={classes.metricGrid}>
          {range(4).map((metric) => (
            <div key={metric} className={classes.stack}>
              <Bone w={88} h={11} />
              {range(3).map((i) => (
                <div key={i} className={classes.barRow}>
                  <Bone w={52} h={11} />
                  <Bone w={`${92 - i * 34}%`} h={8} strong />
                  <Bone w={38} h={11} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

export function DrawerSkeleton() {
  return (
    <Loading label="Loading query" className={classes.stackWide}>
      <StatTilesSkeleton columns={4} />
      <div className={layout.card}>
        <ChartArea size="sm" />
      </div>
      <TableCardSkeleton rows={4} />
    </Loading>
  );
}
