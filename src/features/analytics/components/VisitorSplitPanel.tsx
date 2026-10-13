import { Repeat } from "lucide-react";
import { num } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { DonutBreakdown } from "@/shared/ui/rank/DonutBreakdown";
import rankClasses from "@/shared/ui/rank/Rank.module.css";
import type { VisitorSplit } from "@/shared/types";

export function VisitorSplitPanel({ split }: { split?: VisitorSplit | null }) {
  const fresh = split?.new ?? 0;
  const returning = split?.returning ?? 0;
  const total = fresh + returning;

  return (
    <RankCard
      title="New vs returning"
      icon={Repeat}
      tone="emerald"
      fill={false}
      subtitle={total > 0 ? `${num(total)} unique visitors` : undefined}
    >
      {total === 0 ? (
        <RankEmpty icon={Repeat}>No visitors in this range yet</RankEmpty>
      ) : (
        <>
          <DonutBreakdown
            totalLabel="Visitors"
            items={[
              { id: "new", label: "New", value: fresh },
              { id: "returning", label: "Returning", value: returning },
            ]}
          />
          <p className={rankClasses.note}>
            A visitor counts as returning when they were also seen before the range started.
          </p>
        </>
      )}
    </RankCard>
  );
}
