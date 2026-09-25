import { Box, SimpleGrid, Skeleton } from "@mantine/core";
import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetApiKeysQuery } from "@/app/store";
import { timeAgo } from "@/shared/lib/format";
import { ErrorState } from "@/shared/ui/ErrorState";
import { StatCard } from "@/shared/ui/StatCard";
import type { ApiKeyUsageWindow } from "@/shared/types";
import { latestUse, successRate } from "../../developers";
import { useKeyUsage } from "../../hooks/useKeyUsage";
import { PanelHeader } from "./PanelHeader";
import { UsageChart } from "./UsageChart";
import { UsageControls } from "./UsageControls";
import classes from "./Developers.module.css";

interface Props {
  workspaceId: string;
  windowDays: ApiKeyUsageWindow;
  onWindowChange: (days: ApiKeyUsageWindow) => void;
  focusKeyId: string | null;
  onFocusKey: (keyId: string | null) => void;
}

export function UsageOverview({ workspaceId, windowDays, onWindowChange, focusKeyId, onFocusKey }: Props) {
  const { t } = useTranslation();
  const { data: keys = [] } = useGetApiKeysQuery(workspaceId, { skip: !workspaceId });
  const focusKey = keys.find((k) => k.id === focusKeyId);
  const activeFocus = focusKey ? focusKey.id : null;
  const { view, isLoading, isFetching, loadFailed, retry } = useKeyUsage(workspaceId, windowDays, activeFocus);

  if (!keys.length) return null;

  const lastUsed = focusKey ? focusKey.lastUsedAt : latestUse(keys);

  return (
    <Box className={classes.panel}>
      <PanelHeader
        icon={Activity}
        title={t("developers.usageTitle")}
        description={t("developers.usageDesc")}
        action={
          <UsageControls
            keys={keys}
            windowDays={windowDays}
            onWindowChange={onWindowChange}
            focusKeyId={activeFocus}
            onFocusKey={onFocusKey}
          />
        }
      />

      {loadFailed ? (
        <Box className={classes.emptyWrap}>
          <ErrorState compact title={t("developers.usageLoadError")} onRetry={() => void retry()} retrying={isFetching} />
        </Box>
      ) : isLoading || !view ? (
        <Box className={classes.usageBody}>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={112} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={260} radius="md" mt="md" />
        </Box>
      ) : (
        <Box className={classes.usageBody}>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            <StatCard
              icon={Activity}
              label={t("developers.statRequests")}
              hint={t("developers.statRequestsHint")}
              value={view.totals.requests}
              delta={view.requestsDelta}
              spark={view.points}
              sparkKey="requests"
            />
            <StatCard
              icon={AlertTriangle}
              label={t("developers.statFailed")}
              hint={t("developers.statFailedHint")}
              value={view.totals.failures}
              delta={view.failuresDelta}
              inverseDelta
              spark={view.points}
              sparkKey="failures"
            />
            <StatCard
              icon={CheckCircle2}
              label={t("developers.statSuccessRate")}
              value={successRate(view.totals.requests, view.totals.failures)}
            />
            <StatCard
              icon={Clock}
              label={t("developers.statLastRequest")}
              value={lastUsed ? timeAgo(lastUsed) : t("developers.neverUsed")}
            />
          </SimpleGrid>

          <UsageChart points={view.points} windowDays={windowDays} loading={isFetching} />
        </Box>
      )}
    </Box>
  );
}
