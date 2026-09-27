import { Anchor, Text } from "@mantine/core";
import { AlertTriangle, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import { useGetSearchInspectionQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { verdictOf } from "../inspectionVerdict";
import { IndexStatusSkeleton } from "./SearchSkeletons";
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
  const { data, isLoading, error } = useGetSearchInspectionQuery({ workspaceId, siteId, url });
  const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
    propertyUrl,
  )}&id=${encodeURIComponent(url)}`;

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
