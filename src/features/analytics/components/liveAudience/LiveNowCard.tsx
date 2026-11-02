import { Radio } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LiveAudience } from "@/shared/types";
import { num } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { PathLabel } from "@/shared/ui/rank/PathLabel";
import { LiveStatFooter } from "./LiveStatFooter";
import { LiveVisitorList } from "./LiveVisitorList";
import classes from "./LiveAudience.module.css";

export function LiveNowCard({
  pages,
  total,
  audience,
  onSelectPath,
}: {
  pages: { key: string; count: number }[];
  total: number;
  audience: LiveAudience | null;
  onSelectPath?: (path: string) => void;
}) {
  const { t } = useTranslation();
  const people = audience ? audience.humans : total;
  const nobody = audience ? audience.total === 0 : pages.length === 0;

  return (
    <RankCard
      title="Live now"
      tone="emerald"
      actions={
        <span className={classes.updates}>
          <span className={`status-dot live ${classes.liveDot}`} aria-hidden />
          Updates every 10 s
        </span>
      }
    >
      <div className={classes.hero}>
        <span className={classes.heroValue}>{num(people)}</span>
        <span className={classes.heroLabel}>on your sites</span>
      </div>
      <LiveStatFooter audience={audience} bar={false} />

      {nobody ? (
        <RankEmpty icon={Radio}>{t("analytics.nobodyOnSite")}</RankEmpty>
      ) : (
        <>
          {pages.length > 0 && (
            <div className={classes.block}>
              <RankList
                limit={6}
                columns={{ label: "Page", value: "Now" }}
                items={pages.map((p) => ({
                  id: p.key,
                  label: <PathLabel path={p.key} />,
                  title: onSelectPath ? `Filter by ${p.key}` : p.key,
                  weight: p.count,
                  value: num(p.count),
                }))}
                onSelect={onSelectPath}
              />
            </div>
          )}
          {audience && audience.visitors.length > 0 && (
            <div className={classes.block}>
              <div className={classes.sectionLabel}>Who is on the site</div>
              <LiveVisitorList audience={audience} />
            </div>
          )}
        </>
      )}
    </RankCard>
  );
}
