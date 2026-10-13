import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { num, share } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { DonutBreakdown } from "@/shared/ui/rank/DonutBreakdown";
import type { RankTone } from "@/shared/ui/rank/tones";
import type { Bucket } from "@/shared/types";

export function MiniList({
  title,
  items,
  icon,
  tone = "teal",
  chart = "list",
  format,
  empty,
}: {
  title: string;
  items: Bucket[];
  icon: LucideIcon;
  tone?: RankTone;
  chart?: "list" | "donut";
  format?: (key: string) => ReactNode;
  empty: string;
}) {
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <RankCard
      title={title}
      icon={icon}
      tone={tone}
      subtitle={items.length > 0 ? `${num(total)} total` : undefined}
    >
      {items.length === 0 ? (
        <RankEmpty icon={Inbox}>{empty}</RankEmpty>
      ) : chart === "donut" ? (
        <DonutBreakdown
          items={items.map((i) => ({
            id: i.key,
            label: format ? format(i.key) : i.key,
            title: i.key,
            value: i.count,
          }))}
        />
      ) : (
        <RankList
          limit={6}
          items={items.map((i) => ({
            id: i.key,
            label: format ? format(i.key) : i.key,
            title: i.key,
            value: num(i.count),
            aside: share(i.count, total),
          }))}
        />
      )}
    </RankCard>
  );
}
