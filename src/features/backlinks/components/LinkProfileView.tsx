import type { ReactNode } from "react";
import { Badge } from "@mantine/core";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { AnchorKind, LinkProfile, LinkRel, SourceKind } from "../types";
import { ANCHOR_LABEL, REL_LABEL, SOURCE_LABEL } from "../utils/labels";
import { BreakdownBars } from "./BreakdownBars";
import { ProfileInsights } from "./ProfileInsights";
import classes from "./Backlinks.module.css";

function Fact({ label, value, mine }: { label: string; value: string; mine?: string }) {
  return (
    <div className={classes.fact}>
      <div className={classes.factLabel}>{label}</div>
      <div className={classes.factValue}>
        {value}
        {mine !== undefined && <span className={classes.factCompare}>you {mine}</span>}
      </div>
    </div>
  );
}

function rowsOf<K extends string>(counts: Record<K, number>, labels: Record<K, string>) {
  return (Object.keys(labels) as K[]).map((k) => ({ label: labels[k], value: counts[k] ?? 0 }));
}

export function LinkProfileView({
  name,
  domain,
  profile,
  mine,
  isYou,
  footer,
}: {
  name: string;
  domain: string;
  profile: LinkProfile;
  mine?: LinkProfile;
  isYou?: boolean;
  footer?: ReactNode;
}) {
  const subject = isYou ? "your" : "their";

  return (
    <>
      <section className={classes.card}>
        <div className={classes.profileHead}>
          <span className={classes.favicon}>
            <SiteFavicon domain={domain} size={22} />
          </span>
          <div className={classes.itemText}>
            <h3 className={classes.profileName}>{name}</h3>
            <div className={classes.itemSub}>{isYou ? "Your link profile" : domain}</div>
          </div>
        </div>
        <div className={classes.profileFacts}>
          <Fact label="Links" value={profile.totalLinks.toLocaleString()} mine={mine?.totalLinks.toLocaleString()} />
          <Fact label="Referring domains" value={profile.referringDomains.toLocaleString()} mine={mine?.referringDomains.toLocaleString()} />
          <Fact label="Follow share" value={`${profile.followShare}%`} mine={mine ? `${mine.followShare}%` : undefined} />
          <Fact
            label="Avg. authority"
            value={profile.avgAuthority === null ? "—" : String(profile.avgAuthority)}
            mine={mine && mine.avgAuthority !== null ? String(mine.avgAuthority) : undefined}
          />
        </div>
      </section>

      {profile.totalLinks > 0 && (
        <>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <div>
                <h3 className={classes.cardTitle}>How {subject} links work</h3>
                <p className={classes.cardSub}>
                  What the mix of anchors, link types and linking sites says about how {isYou ? "you earn" : "they earn"} links.
                </p>
              </div>
            </div>
            {profile.insights.length > 0 ? (
              <ProfileInsights insights={profile.insights} />
            ) : (
              <p className={classes.cardSub}>A balanced profile with no single pattern dominating.</p>
            )}
          </section>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <h3 className={classes.cardTitle}>Breakdown</h3>
            </div>
            <div className={classes.breakdownGrid}>
              <BreakdownBars title="Link type" rows={rowsOf<LinkRel>(profile.rel, REL_LABEL)} />
              <BreakdownBars title="Anchor text" rows={rowsOf<AnchorKind>(profile.anchors, ANCHOR_LABEL)} />
              <BreakdownBars title="Linking sites" rows={rowsOf<SourceKind>(profile.sources, SOURCE_LABEL)} />
            </div>
          </section>

          <section className={classes.card}>
            <div className={classes.lists}>
              <div>
                <h4 className={classes.breakdownTitle}>Top referring domains</h4>
                {profile.topDomains.map((d) => (
                  <div key={d.domain} className={classes.listRow}>
                    <span className={classes.listMain}>
                      <SiteFavicon domain={d.domain} size={16} />
                      <span className={classes.listText}>{d.domain}</span>
                    </span>
                    <Badge size="xs" variant="light" color="gray" radius="sm">
                      {SOURCE_LABEL[d.kind]}
                    </Badge>
                  </div>
                ))}
              </div>
              <div>
                <h4 className={classes.breakdownTitle}>Most used anchors</h4>
                {profile.topAnchors.length === 0 && <p className={classes.cardSub}>No text anchors.</p>}
                {profile.topAnchors.map((a) => (
                  <div key={a.text} className={classes.listRow}>
                    <span className={classes.listText}>{a.text}</span>
                    <span className={classes.listMain}>
                      <Badge size="xs" variant="light" color="gray" radius="sm">
                        {ANCHOR_LABEL[a.kind]}
                      </Badge>
                      <span className={classes.muted}>×{a.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {footer}
    </>
  );
}
