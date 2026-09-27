import { Anchor, Skeleton, Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2, CircleSlash, ExternalLink, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { useGetSearchInspectionQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchInspection } from "@/shared/types";
import classes from "./pageDetail.module.css";

function humanize(value?: string) {
  if (!value) return "—";
  if (!/^[A-Z_]+$/.test(value)) return value;
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function verdictOf(data: SearchInspection) {
  const coverage = (data.coverageState ?? "").toLowerCase();
  if (data.verdict === "PASS" || (coverage.includes("indexed") && !coverage.includes("not indexed"))) {
    return { tone: "good", icon: CheckCircle2, title: "Page is on Google" };
  }
  if (/blocked|noindex|robots/.test(coverage)) {
    return { tone: "warn", icon: CircleSlash, title: "Page is blocked from Google" };
  }
  return { tone: "bad", icon: XCircle, title: "Page is not on Google" };
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
  const { data, isLoading, error } = useGetSearchInspectionQuery({ workspaceId, siteId, url });
  const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    propertyUrl,
  )}&id=${encodeURIComponent(url)}`;

  if (isLoading) {
    return (
      <div className={classes.status}>
        <Text size="xs" c="dimmed">
          Asking Google for the index status…
        </Text>
        <Skeleton height={26} width="60%" radius="sm" />
        <Skeleton height={60} radius="sm" />
      </div>
    );
  }

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

      <Anchor href={inspectUrl} target="_blank" rel="noopener noreferrer" size="xs">
        Inspect in Search Console <ExternalLink size={11} />
      </Anchor>
    </div>
  );
}
