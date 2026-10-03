import { useState, type ReactNode } from "react";
import { UnstyledButton } from "@mantine/core";
import { Swords } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { useGetCompetitorBacklinksQuery } from "../api";
import type { BacklinkOverview } from "../types";
import { CompetitorLinkTable } from "./CompetitorLinkTable";
import { LinkProfileView } from "./LinkProfileView";
import classes from "./Backlinks.module.css";

const YOU = "you";

export function CompetitorLinksTab({
  overview,
  workspaceId,
  siteId,
  myDomain,
  myFramework,
  notice,
}: {
  overview: BacklinkOverview;
  workspaceId: string;
  siteId: string;
  myDomain: string;
  myFramework?: string;
  notice: ReactNode;
}) {
  const { mine, competitors } = overview.profiles;
  const [picked, setPicked] = useState<string | null>(null);
  const selectedId = picked ?? competitors[0]?.competitorId ?? YOU;
  const selected = competitors.find((c) => c.competitorId === selectedId) ?? null;

  const { data: links = [], isFetching } = useGetCompetitorBacklinksQuery(
    { workspaceId, siteId, competitorId: selected?.competitorId ?? "" },
    { skip: !selected },
  );

  if (competitors.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        compact
        title="No competitors tracked yet"
        description="Competitor backlinks are collected for the competitors you track on the Compare page. Add one there and its links start showing up here."
        action={{ label: "Track a competitor", to: "/app/compare", icon: Swords }}
      />
    );
  }

  return (
    <div className={classes.stack}>
      {notice}
      <div className={classes.workspace}>
        <aside className={classes.rail}>
          <div className={classes.railHead}>Link profiles</div>
          <UnstyledButton
            className={classes.railItem}
            data-you
            data-active={selectedId === YOU || undefined}
            onClick={() => setPicked(YOU)}
          >
            <SiteFavicon domain={myDomain} framework={myFramework} size={18} />
            <div className={classes.itemText}>
              <div className={classes.itemLabel}>{myDomain}</div>
              <div className={classes.itemSub}>You · {mine.followShare}% follow</div>
            </div>
            <span className={classes.itemValue}>{mine.referringDomains}</span>
          </UnstyledButton>
          {[...competitors]
            .sort((a, b) => b.profile.referringDomains - a.profile.referringDomains)
            .map((c) => (
              <UnstyledButton
                key={c.competitorId}
                className={classes.railItem}
                data-active={c.competitorId === selectedId || undefined}
                onClick={() => setPicked(c.competitorId)}
              >
                <SiteFavicon domain={c.domain} size={18} />
                <div className={classes.itemText}>
                  <div className={classes.itemLabel}>{c.label}</div>
                  <div className={classes.itemSub}>
                    {c.profile.totalLinks > 0 ? `${c.profile.followShare}% follow` : "No links found yet"}
                  </div>
                </div>
                <span className={classes.itemValue}>{c.profile.referringDomains}</span>
              </UnstyledButton>
            ))}
        </aside>

        <div className={classes.stack}>
          {selected ? (
            <LinkProfileView
              name={selected.label}
              domain={selected.domain}
              profile={selected.profile}
              mine={mine}
              footer={<CompetitorLinkTable links={links} loading={isFetching} />}
            />
          ) : (
            <LinkProfileView name={myDomain} domain={myDomain} profile={mine} isYou />
          )}
        </div>
      </div>
    </div>
  );
}
