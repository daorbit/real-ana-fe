import { Table } from "@mantine/core";
import { Bone } from "../SkeletonBone";
import classes from "../skeleton.module.css";
import layout from "../searchConsole.module.css";
import metrics from "../metrics.module.css";
import { GroupHead, Loading } from "./parts";
import { LABEL_WIDTHS, range } from "./shape";

export type BoneColumn = "share" | "shareSmall" | "num" | "pill" | "text";

const BONE: Record<BoneColumn, { w: number; h: number; head: number }> = {
  share: { w: 34, h: 12, head: 40 },
  shareSmall: { w: 34, h: 12, head: 40 },
  num: { w: 46, h: 12, head: 52 },
  pill: { w: 58, h: 20, head: 44 },
  text: { w: 150, h: 12, head: 56 },
};

function Cell({ column }: { column: BoneColumn }) {
  const { w, h } = BONE[column];
  if (column === "share" || column === "shareSmall") {
    return (
      <span className={metrics.share} data-compact={column === "shareSmall" || undefined}>
        <span className={metrics.shareTrack} />
        <Bone w={w} h={h} strong />
      </span>
    );
  }
  return <Bone w={w} h={h} shape={column === "pill" ? "pill" : "line"} className={classes.cellBone} />;
}

export function TableBones({
  columns,
  rows,
  rank = false,
  chevron = false,
}: {
  columns: BoneColumn[];
  rows: number;
  rank?: boolean;
  chevron?: boolean;
}) {
  return (
    <div className={`${layout.listCard} ${classes.tableClip}`}>
      <Table fz="xs" className={layout.table}>
        <Table.Thead>
          <Table.Tr>
            {rank && <Table.Th className={layout.rankCell} />}
            <Table.Th>
              <Bone w={48} h={10} />
            </Table.Th>
            {columns.map((column, i) => (
              <Table.Th key={i} className={layout.numCell} data-text={column === "text" || undefined}>
                <Bone w={BONE[column].head} h={10} className={classes.cellBone} />
              </Table.Th>
            ))}
            {chevron && <Table.Th className={layout.chevronCell} />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {range(rows).map((row) => (
            <Table.Tr key={row}>
              {rank && (
                <Table.Td className={layout.rankCell}>
                  <Bone w={12} h={10} />
                </Table.Td>
              )}
              <Table.Td className={layout.topLabelCell}>
                <Bone w={LABEL_WIDTHS[row % LABEL_WIDTHS.length]} h={12} strong />
              </Table.Td>
              {columns.map((column, i) => (
                <Table.Td key={i} className={layout.numCell}>
                  <Cell column={column} />
                </Table.Td>
              ))}
              {chevron && (
                <Table.Td className={layout.chevronCell}>
                  <Bone w={8} h={12} />
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}

const DEFAULT_COLUMNS: BoneColumn[] = ["shareSmall", "num", "pill"];

export function TableCardSkeleton({
  rows = 6,
  columns = DEFAULT_COLUMNS,
  chevron = true,
  large = false,
}: {
  rows?: number;
  columns?: BoneColumn[];
  chevron?: boolean;
  large?: boolean;
}) {
  return (
    <div className={layout.group} aria-hidden>
      <GroupHead large={large} />
      <TableBones columns={columns} rows={rows} chevron={chevron} />
    </div>
  );
}

export function BreakdownSkeleton({ showViews = false, chevron = false }: { showViews?: boolean; chevron?: boolean }) {
  const columns: BoneColumn[] = ["share", "num", ...(showViews ? (["num"] as const) : []), "num", "num", "pill"];
  return (
    <Loading label="Loading report" className={layout.group}>
      <GroupHead large right={<Bone w={280} h={36} shape="block" />} />
      <TableBones rank columns={columns} rows={10} chevron={chevron} />
      <div className={`${classes.spread} ${layout.pagerRow}`}>
        <Bone w={96} h={11} />
        <div className={classes.inline}>
          <Bone w={80} h={30} shape="block" />
          <Bone w={58} h={30} shape="block" />
        </div>
      </div>
    </Loading>
  );
}
