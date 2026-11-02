import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Center, Progress, Skeleton, Text } from "@mantine/core";
import { ArrowUpRight, Search, Gauge as GaugeIcon } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLatestSeoReportQuery } from "@/app/store";
import { scoreColor, scoreLabel } from "@/features/seo/components/ScoreRing";
import { Gauge } from "@/features/seo/components/shared/Gauge";
import { bandHex } from "@/features/seo/components/utils";
import { timeAgo } from "@/shared/lib";
import classes from "./SeoScoreCard.module.css";

function band(score: number): "good" | "warn" | "bad" {
  return score >= 90 ? "good" : score >= 50 ? "warn" : "bad";
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <div className={classes.head}>
        <div className={classes.title}>
          <GaugeIcon size={15} className="sect-ic" />
          <Text fw={600} c="dimmed" size="sm" truncate>
            SEO health
          </Text>
        </div>
        <Button component={Link} to="/app/seo" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
          Audit
        </Button>
      </div>
      {children}
    </Card>
  );
}

function CategoryBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className={classes.catTop}>
        <span>{label}</span>
        <span className={classes.catValue}>{score ?? "—"}</span>
      </div>
      <Progress
        value={score ?? 0}
        color={bandHex(score)}
        size={6}
        radius="xl"
        classNames={{ root: classes.track }}
        aria-label={`${label} ${score ?? "not measured"}`}
      />
    </div>
  );
}

export function SeoScoreCard({
  workspaceId,
  siteId,
  siteName,
}: {
  workspaceId: string;
  siteId: string;
  siteName?: string;
}) {
  const { data: report, isLoading } = useGetLatestSeoReportQuery(
    workspaceId && siteId ? { workspaceId, siteId } : skipToken
  );

  if (isLoading) {
    return (
      <Frame>
        <Center py="md">
          <Skeleton height={104} circle />
        </Center>
      </Frame>
    );
  }

  if (!report?.data) {
    return (
      <Frame>
        <div className={classes.empty}>
          <Search size={22} className={classes.emptyIcon} />
          <span className={classes.emptyTitle}>No audit yet</span>
          <span className={classes.emptyText}>Run an SEO audit to see this site's score at a glance.</span>
          <Button component={Link} to="/app/seo" size="xs" variant="default" className={classes.emptyAction}>
            Run an audit
          </Button>
        </div>
      </Frame>
    );
  }

  const { data } = report;
  const critical = data.issues.filter((i) => i.severity === "critical").length;
  const warnings = data.issues.filter((i) => i.severity === "warning").length;
  const suggestions = data.issues.filter((i) => i.severity === "info").length;
  const scores = data.performance.scores;

  return (
    <Frame>
      <div className={classes.body}>
        <div className={classes.gaugeCol}>
          <Gauge value={data.score} size={104} thickness={9} color={bandHex(data.score)}>
            <Text className="g-num" fz={32}>{data.score}</Text>
            <Text className="g-of">of 100</Text>
          </Gauge>
          <Badge size="sm" variant="light" color={scoreColor(data.score)}>
            {scoreLabel(data.score)}
          </Badge>
        </div>
        <div className={classes.side}>
          {data.performance.available && (
            <div className={classes.cats}>
              <CategoryBar label="Performance" score={scores.performance} />
              <CategoryBar label="Accessibility" score={scores.accessibility} />
              <CategoryBar label="Best practices" score={scores.bestPractices} />
            </div>
          )}
          <div className={classes.issues}>
            {critical > 0 && (
              <Badge size="sm" variant="light" color="red">
                {critical} critical
              </Badge>
            )}
            {warnings > 0 && (
              <Badge size="sm" variant="light" color="yellow">
                {warnings} warning{warnings === 1 ? "" : "s"}
              </Badge>
            )}
            {suggestions > 0 && (
              <Badge size="sm" variant="light" color="blue">
                {suggestions} suggestion{suggestions === 1 ? "" : "s"}
              </Badge>
            )}
            {critical === 0 && warnings === 0 && suggestions === 0 && (
              <Badge size="sm" variant="light" color="teal">
                No issues
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className={classes.foot}>
        <span className={classes.footDot} data-band={band(data.score)} aria-hidden />
        <span className={classes.footText}>
          {siteName ? `${siteName} · ` : ""}Audited {timeAgo(report.createdAt)}
        </span>
      </div>
    </Frame>
  );
}
