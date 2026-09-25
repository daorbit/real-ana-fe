import { Skeleton } from "@mantine/core";
import { Activity, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetApiKeysQuery } from "@/app/store";
import { num, timeAgo } from "@/shared/lib/format";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ApiKeyUsageWindow } from "@/shared/types";
import { latestUse, successRate } from "../../developers";
import { useKeyUsage } from "../../hooks/useKeyUsage";
import { SectionHeader } from "./SectionHeader";
import { UsageChart } from "./UsageChart";
import { UsageControls } from "./UsageControls";
import classes from "./Developers.module.css";

interface Props {
  workspaceId: string;
  windowDays: ApiKeyUsageWindow;
  onWindowChange: (days: ApiKeyUsageWindow) => void;
  focusKeyId: string | null;
  onFocusKey: (keyId: string | null) => void;
  onCreateKey: () => void;
}

function Delta({ value, inverse }: { value: number | null; inverse?: boolean }) {
  const { t } = useTranslation();
  if (value === null) return null;
  const good = inverse ? value <= 0 : value >= 0;
  return (
    <span className={classes.delta} data-tone={value === 0 ? "flat" : good ? "up" : "down"}>
      {value > 0 ? "+" : ""}
      {value}% <span className={classes.deltaHint}>{t("developers.vsPrevious")}</span>
    </span>
  );
}

export function UsageOverview({
  workspaceId, windowDays, onWindowChange, focusKeyId, onFocusKey, onCreateKey,
}: Props) {
  const { t } = useTranslation();
  const { data: keys = [], isLoading: keysLoading } = useGetApiKeysQuery(workspaceId, { skip: !workspaceId });
  const focusKey = keys.find((k) => k.id === focusKeyId);
  const activeFocus = focusKey ? focusKey.id : null;
  const { view, isLoading, isFetching, loadFailed, retry } = useKeyUsage(workspaceId, windowDays, activeFocus);

  if (!keysLoading && !keys.length) {
    return (
      <div className={classes.card}>
        <EmptyState
          compact
          icon={Activity}
          title={t("developers.usageNoKeysTitle")}
          description={t("developers.usageNoKeysBody")}
          action={{ label: t("developers.createKey"), icon: Plus, onClick: onCreateKey }}
        />
      </div>
    );
  }

  const lastUsed = focusKey ? focusKey.lastUsedAt : latestUse(keys);

  return (
    <div>
      <SectionHeader
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
        <div className={classes.card}>
          <ErrorState compact title={t("developers.usageLoadError")} onRetry={() => void retry()} retrying={isFetching} />
        </div>
      ) : isLoading || !view ? (
        <>
          <Skeleton height={92} radius="md" />
          <Skeleton height={300} radius="md" mt="md" />
        </>
      ) : (
        <>
          <div className={classes.metrics}>
            <div className={classes.metric}>
              <span className={classes.metricLabel}>{t("developers.statRequests")}</span>
              <span className={classes.metricValue}>{num(view.totals.requests)}</span>
              <Delta value={view.requestsDelta} />
            </div>
            <div className={classes.metric}>
              <span className={classes.metricLabel}>{t("developers.statFailed")}</span>
              <span className={classes.metricValue}>{num(view.totals.failures)}</span>
              <Delta value={view.failuresDelta} inverse />
            </div>
            <div className={classes.metric}>
              <span className={classes.metricLabel}>{t("developers.statSuccessRate")}</span>
              <span className={classes.metricValue}>{successRate(view.totals.requests, view.totals.failures)}</span>
            </div>
            <div className={classes.metric}>
              <span className={classes.metricLabel}>{t("developers.statLastRequest")}</span>
              <span className={classes.metricValue}>{lastUsed ? timeAgo(lastUsed) : t("developers.neverUsed")}</span>
            </div>
          </div>

          <UsageChart points={view.points} windowDays={windowDays} loading={isFetching} />
        </>
      )}
    </div>
  );
}
