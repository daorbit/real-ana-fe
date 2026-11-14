import { Skeleton } from "@mantine/core";
import { PhoneSkeleton } from "../skeletons/PhoneSkeleton";
import skeleton from "../skeletons/BioSkeleton.module.css";
import classes from "./BioStudio.module.css";

const ROWS = [0, 1, 2, 3];

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className={skeleton.section}>
      <Skeleton height={12} width={90} radius="xl" />
      <div className={skeleton.card}>
        {ROWS.slice(0, rows).map((i) => (
          <div key={i} className={skeleton.row}>
            <Skeleton height={28} width={28} radius={8} />
            <div className={skeleton.rowText}>
              <Skeleton height={11} width="46%" radius="xl" />
              <Skeleton height={9} width="28%" radius="xl" />
            </div>
            <Skeleton height={14} width={14} radius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BioStudioSkeleton() {
  return (
    <div className={classes.studio} aria-busy aria-label="Loading the editor">
      <div className={skeleton.column}>
        <div className={`${skeleton.card} ${skeleton.header}`}>
          <Skeleton circle height={60} />
          <div className={skeleton.rowText}>
            <Skeleton height={16} width="40%" radius="xl" />
            <Skeleton height={11} width="64%" radius="xl" />
          </div>
        </div>
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={2} />
      </div>
      <div className={classes.previewCol}>
        <div className={skeleton.stage}>
          <PhoneSkeleton />
        </div>
      </div>
    </div>
  );
}
