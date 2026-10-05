import { useMemo } from "react";
import { Anchor, Button, Text } from "@mantine/core";
import { AlertTriangle, ArrowRight, ExternalLink, Lock } from "lucide-react";
import dayjs from "dayjs";
import { useGetSearchInspectionQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { useDemo } from "@/features/demo/context";
import { demoSearchInspection } from "@/features/demo/demoSearchConsole";
import { verdictOf } from "../inspectionVerdict";
import { useSearchEntitlements, useSearchUpgrade } from "../useSearchEntitlements";
import { IndexStatusSkeleton } from "./SearchSkeletons";
import { IndexInspectionDetails } from "./IndexInspectionDetails";
import classes from "./pageDetail.module.css";

function humanize(value?: string) {
  if (!value) return "—";
  if (!/^[A-Z_]+$/.test(value)) return value;
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SearchIndexStatusCard({
  workspaceId,
  siteId,
  propertyUrl,
  url,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  url: string;
}) {
  const ent = useSearchEntitlements();
  const { goToPlans } = useSearchUpgrade();
  const real = useGetSearchInspectionQuery(
    { workspaceId, siteId, url },
    { skip: !ent.canInspect },
  );
  const { demo } = useDemo();
  const sample = useMemo(() => (demo && ent.canInspect ? demoSearchInspection(url) : null), [demo, ent.canInspect, url]);
  const data = sample ?? real.data;
  const isLoading = sample ? false : real.isLoading;
  const error = sample ? undefined : real.error;
  const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    propertyUrl,
  )}&id=${encodeURIComponent(url)}`;

  if (!ent.canInspect) {
    return (
      <div className={classes.status}>
        <div className={classes.statusHead}>
          <Lock size={18} />
          <Text fw={650} size="sm">
            {ent.inspectionQuota > 0 ? "No index checks left this month" : "Check if this page is on Google"}
          </Text>
        </div>
        <Text size="xs" c="dimmed">
          {ent.inspectionQuota > 0
            ? `You've used all ${ent.inspectionQuota} Google index checks on the ${ent.planName} plan. Upgrade for more, or check it directly in Search Console.`
            : "See whether Google has indexed this page, when it was last crawled, and why not if it isn't. Included from the Starter plan."}
        </Text>
        <Button size="xs" color="emerald" rightSection={<ArrowRight size={13} />} onClick={goToPlans}>
          See plans
        </Button>
        <Anchor href={inspectUrl} target="_blank" rel="noopener noreferrer" size="xs">
          Inspect in Search Console <ExternalLink size={11} />
        </Anchor>
      </div>
    );
  }

  if (isLoading) return <IndexStatusSkeleton />;

  if (error || !data) {
    return (
      <div className={classes.status} data-tone="warn">
        <div className={classes.statusHead}>
          <AlertTriangle size={18} />
          <Text fw={650} size="sm">
            Index status unavailable
          </Text>
        </div>
        <Text size="xs" c="dimmed">
          {errMessage(error, "Google did not return an inspection result for this URL.")}
        </Text>
        <Anchor href={inspectUrl} target="_blank" rel="noopener noreferrer" size="xs">
          Inspect in Search Console <ExternalLink size={11} />
        </Anchor>
      </div>
    );
  }

  const verdict = verdictOf(data);
  const Icon = verdict.icon;
  const facts = [
    { label: "Reason", value: data.coverageState || data.indexStatus },
    { label: "Last crawl", value: data.lastCrawled ? dayjs(data.lastCrawled).format("MMM D, YYYY · HH:mm") : "Never" },
    { label: "Page fetch", value: humanize(data.pageFetchState) },
    { label: "Crawl allowed", value: humanize(data.robotsTxtState) },
    ...(data.crawledAs ? [{ label: "Crawled as", value: humanize(data.crawledAs) }] : []),
  ];

  return (
    <div className={classes.status} data-tone={verdict.tone}>
      <div className={classes.statusHead}>
        <Icon size={20} />
        <div>
          <Text fw={700} size="md">
            {verdict.title}
          </Text>
          <Text size="xs" c="dimmed">
            URL Inspection · checked {dayjs(data.fetchedAt).format("MMM D, HH:mm")}
          </Text>
        </div>
      </div>

      <dl className={classes.facts}>
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {data.issues.length > 0 && (
        <ul className={classes.issues}>
          {data.issues.slice(0, 4).map((issue, i) => (
            <li key={`${issue.message}-${i}`}>{issue.message}</li>
          ))}
        </ul>
      )}

      <IndexInspectionDetails data={data} />

      <Anchor href={inspectUrl} target="_blank" rel="noopener noreferrer" size="xs">
        Inspect in Search Console <ExternalLink size={11} />
      </Anchor>
    </div>
  );
}
