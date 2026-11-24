import type { ReactNode } from "react";
import { Bone } from "../SkeletonBone";
import classes from "../skeleton.module.css";
import layout from "../searchConsole.module.css";
import metrics from "../metrics.module.css";
import tile from "@/shared/ui/MetricTile.module.css";
import { range } from "./shape";

const TRACE = "M0 62 L8 50 L16 56 L25 58 L33 70 L41 78 L50 52 L58 44 L66 52 L75 40 L83 30 L91 38 L100 26";
const SPARK = "M0 30 L12 24 L24 27 L36 16 L48 21 L60 12 L72 17 L84 8 L100 11";

export function Loading({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`${classes.loading} ${className ?? ""}`} role="status" aria-label={label} aria-busy>
      {children}
    </div>
  );
}

export function CardHead({ title = 140, desc = 280, right }: { title?: number; desc?: number; right?: ReactNode }) {
  return (
    <div className={layout.cardHead}>
      <div className={classes.stack}>
        <Bone w={title} h={14} strong />
        <Bone w={desc} h={11} />
      </div>
      {right}
    </div>
  );
}

export function GroupHead({ large = false, right }: { large?: boolean; right?: ReactNode }) {
  return (
    <div className={layout.groupHead}>
      <div className={classes.stack}>
        <Bone w={large ? 160 : 130} h={large ? 18 : 14} strong />
        <Bone w={large ? 320 : 240} h={11} />
      </div>
      {right}
    </div>
  );
}

export function HeadlineSkeleton({ action }: { action?: ReactNode }) {
  return (
    <div className={layout.headline}>
      <div className={classes.spread}>
        <div className={`${classes.grow} ${classes.stack}`}>
          <Bone w="58%" h={19} strong />
          <Bone w="40%" h={12} />
        </div>
        {action}
      </div>
    </div>
  );
}

function StatTileSkeleton() {
  return (
    <div className={tile.tile} data-static>
      <div className={tile.body}>
        <div className={tile.head}>
          <Bone w={16} h={16} shape="circle" strong />
          <Bone w={92} h={11} />
        </div>
        <div className={classes.tileValue}>
          <Bone w={104} h={30} shape="block" strong />
          <Bone w={48} h={18} shape="pill" />
        </div>
        <Bone w={96} h={10} className={classes.tileNote} />
      </div>
      <div className={tile.spark}>
        <svg className={classes.sparkTrace} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
          <path d={`${SPARK} L100 40 L0 40 Z`} className={classes.sparkFill} />
          <path d={SPARK} className={classes.sparkLine} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
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

export function ChartArea({ size }: { size?: "sm" }) {
  return (
    <div className={classes.chartArea} data-size={size}>
      {range(4).map((i) => (
        <span key={i} className={classes.gridLine} />
      ))}
      <svg className={classes.chartTrace} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d={`${TRACE} L100 100 L0 100 Z`} className={classes.sparkFill} />
        <path d={TRACE} className={classes.sparkLine} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={classes.chartTicks}>
        {range(5).map((i) => (
          <Bone key={i} w={40} h={10} />
        ))}
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className={layout.card}>
      <CardHead title={160} desc={340} right={<Bone w={150} h={12} />} />
      <ChartArea />
    </div>
  );
}
