import { ArrowDownWideNarrow, LogIn } from "lucide-react";
import { num, share } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { DepthRing } from "@/shared/ui/rank/DepthRing";
import { PathLabel } from "@/shared/ui/rank/PathLabel";
import type { RankTone } from "@/shared/ui/rank/tones";
import type { ScrollBucket, LandingBucket } from "@/shared/types";

function depthTone(depth: number): RankTone {
  if (depth >= 70) return "emerald";
  if (depth >= 40) return "amber";
  return "pink";
}

export function ScrollPanel({
  items,
  outdated = false,
}: {
  items: ScrollBucket[];
  outdated?: boolean;
}) {
  return (
    <RankCard
      title="Scroll depth"
      icon={ArrowDownWideNarrow}
      tone="indigo"
      subtitle={items.length > 0 ? "Average depth · share who reach the end" : undefined}
    >
      {items.length === 0 ? (
        <RankEmpty icon={ArrowDownWideNarrow}>
          {outdated
            ? "Your tracking script is too old to measure scroll depth. Update it using the banner at the top of this page — no markup needed, it works as soon as the new script loads."
            : "Waiting for the first visitors to scroll a page."}
        </RankEmpty>
      ) : (
        <RankList
          showRank={false}
          items={items.map((i) => ({
            id: i.key,
            leading: <DepthRing percent={i.avgDepth} />,
            label: <PathLabel path={i.key} />,
            title: i.key,
            value: `${i.avgDepth}%`,
            aside: `${i.completionRate}% finish`,
            tone: depthTone(i.avgDepth),
          }))}
        />
      )}
    </RankCard>
  );
}

export function LandingPanel({ items }: { items: LandingBucket[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <RankCard
      title="Landing pages"
      icon={LogIn}
      tone="blue"
      subtitle={items.length > 0 ? `${num(total)} sessions` : undefined}
    >
      {items.length === 0 ? (
        <RankEmpty icon={LogIn}>Waiting for data…</RankEmpty>
      ) : (
        <RankList
          strip
          items={items.map((i) => ({
            id: i.key,
            label: <PathLabel path={i.key} />,
            weight: i.count,
            title: i.key,
            value: num(i.count),
            aside: share(i.count, total),
            meta: `${i.bounceRate}% bounce · ${i.pagesPerSession} pages / session`,
          }))}
        />
      )}
    </RankCard>
  );
}
