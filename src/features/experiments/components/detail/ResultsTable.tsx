import { useEffect, useRef } from "react";
import { Badge, Table } from "@mantine/core";
import { num } from "@/shared/lib/format";
import { percent, signedPercent } from "@/features/experiments/lib/experimentLabels";
import type { ExperimentResults, VariantResult } from "@/features/experiments/types";
import classes from "../Experiments.module.css";

function RateBar({ rate, max }: { rate: number; max: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.style.setProperty("width", `${max > 0 ? Math.round((rate / max) * 100) : 0}%`);
  }, [rate, max]);
  return (
    <div className={classes.bar} aria-hidden>
      <div ref={ref} className={classes.barFill} />
    </div>
  );
}

function upliftClass(value: VariantResult["uplift"]): string | undefined {
  if (value === null || value === 0) return undefined;
  return value > 0 ? classes.up : classes.down;
}

export function ResultsTable({ results }: { results: ExperimentResults }) {
  const max = Math.max(...results.variants.map((v) => v.rate), 0);

  return (
    <div className={classes.tableWrap}>
      <Table verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Group</Table.Th>
            <Table.Th ta="right">Visitors</Table.Th>
            <Table.Th ta="right">Reached goal</Table.Th>
            <Table.Th>Conversion</Table.Th>
            <Table.Th ta="right">vs original</Table.Th>
            <Table.Th ta="right">Chance to beat</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {results.variants.map((v, i) => (
            <Table.Tr key={v.key}>
              <Table.Td>
                {v.name} {results.winner === v.key && <Badge variant="light" color="teal" ml={6}>Winner</Badge>}
              </Table.Td>
              <Table.Td ta="right">{num(v.sessions)}</Table.Td>
              <Table.Td ta="right">{num(v.conversions)}</Table.Td>
              <Table.Td>
                <span>{percent(v.rate)}</span>
                <RateBar rate={v.rate} max={max} />
              </Table.Td>
              <Table.Td ta="right" className={upliftClass(v.uplift)}>
                {i === 0 ? "Baseline" : signedPercent(v.uplift)}
              </Table.Td>
              <Table.Td ta="right">{i === 0 ? "–" : percent(v.confidence, 0)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
