import { Tooltip } from "@mantine/core";
import { MousePointerClick, Link2 } from "lucide-react";
import { compact, share } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import type { ClickBucket } from "@/shared/types";

export function ClicksPanel({
  clicks,
  total,
  limit = 8,
}: {
  clicks: ClickBucket[];
  total: number;
  limit?: number;
}) {
  return (
    <RankCard
      title="Most clicked"
      tone="violet"
      subtitle={total > 0 ? `${compact(total)} clicks across ${clicks.length} buttons and links` : "Buttons and links on your pages"}
    >
      {clicks.length === 0 ? (
        <RankEmpty icon={MousePointerClick}>
          No clicks recorded yet. Buttons and links are tracked automatically.
        </RankEmpty>
      ) : (
        <RankList
          limit={limit}
          columns={{ label: "Element", value: "Clicks", aside: "Share" }}
          items={clicks.map((c) => ({
            weight: c.count,
            id: `${c.key}|${c.path}`,
            label: c.key,
            title: c.key,
            value: compact(c.count),
            aside: share(c.count, total),
            meta: (
              <>
                on {c.path}
                {c.href && (
                  <Tooltip label={c.href} withArrow>
                    <Link2 size={12} className="click-href" />
                  </Tooltip>
                )}
              </>
            ),
          }))}
        />
      )}
    </RankCard>
  );
}
