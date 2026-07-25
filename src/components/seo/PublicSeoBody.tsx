import { Stack, Group, Text, Alert, Tooltip } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import {
  ScorePanel, IssueList, MetaPanel, ContentPanel, TechnicalPanel, SuggestionsPanel,
} from "./SeoPanels";
import { LinksPanel } from "./LinksPanel";
import { SchemaPanel } from "./SchemaPanel";
import { dateTime, timeAgo } from "../../utils";
import type { PublicSeoReport } from "../../types";

/**
 * The read-only body of one shared SEO audit: exactly the panels the owner
 * published, in the fixed report order.
 *
 * Kept free of any page chrome so it can render on its own dedicated public
 * page (`PublicSeoReport`) and, unchanged, inside the shared dashboard's SEO
 * tab. A panel missing here means the server never sent its data, not that it
 * is merely hidden.
 */
export function PublicSeoBody({
  data,
  hideHeader = false,
}: {
  data: PublicSeoReport;
  /** Suppress the "SEO audit" heading — the host page already carries one. */
  hideHeader?: boolean;
}) {
  const p = data.panels;
  const critical = data.issues.filter((i) => i.severity === "critical").length;

  return (
    <Stack gap="lg">
      {!hideHeader && (
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Text fw={700} fz={22} style={{ letterSpacing: "-0.02em" }}>
            SEO audit
          </Text>
          <Tooltip label={dateTime(data.createdAt)} withArrow>
            <Text size="xs" c="dimmed">Audited {timeAgo(data.createdAt)}</Text>
          </Tooltip>
        </Group>
      )}

      {p.summary && data.performance && (
        <ScorePanel
          score={data.score}
          performance={data.performance}
          issues={p.issues ? data.issues : []}
        />
      )}

      {p.issues && (
        <Stack gap="md">
          {critical > 0 && (
            <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
              {critical} critical issue{critical === 1 ? "" : "s"} on this page.
            </Alert>
          )}
          <IssueList issues={data.issues} />
        </Stack>
      )}

      {p.meta && data.meta && <MetaPanel meta={data.meta} url={data.finalUrl} />}
      {p.content && data.content && <ContentPanel content={data.content} />}
      {p.technical && data.technical && data.siteFiles && data.performance && (
        <TechnicalPanel
          technical={data.technical}
          performance={data.performance}
          siteFiles={data.siteFiles}
        />
      )}
      {p.performance && data.performance && (
        <SuggestionsPanel performance={data.performance} />
      )}
      {p.links && data.links && <LinksPanel links={data.links} />}
      {p.schema && data.schema && <SchemaPanel schema={data.schema} />}
    </Stack>
  );
}
