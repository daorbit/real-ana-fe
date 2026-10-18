import { Button } from "@mantine/core";
import { BellRing } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { SaveBarProvider } from "@/shared/ui/SaveBar";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useAlertTest } from "@/features/alerts/hooks/useAlertTest";
import { AlertsBody } from "@/features/alerts/components/AlertsBody";
import { AlertsSkeleton } from "@/features/alerts/components/AlertsSkeleton";

export default function Alerts() {
  useTitle("Alerts");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { alerts: alertsOn, goals: goalsOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { overview, loading, failed, refresh, refreshing, lastUpdated } = useAlerts(alertsOn ? workspaceId : undefined);
  const test = useAlertTest(workspaceId);

  return (
    <AppShell>
      <PageHeader
        title="Alerts"
        description="Hear about traffic drops, spikes and stalled goals as they happen."
        docsPath={DOCS_SLUGS.quantalogAlerts}
        actions={
          alertsOn && overview ? (
            <>
              <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
              {canEdit && (
                <Button variant="default" leftSection={<BellRing size={15} />} loading={test.sending} onClick={() => void test.send()}>
                  Send a test
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!alertsOn ? (
        <QuantalogAppGate app="alerts" />
      ) : failed ? (
        <ErrorState onRetry={() => void refresh()} retrying={refreshing} />
      ) : loading || !overview ? (
        <AlertsSkeleton />
      ) : (
        <SaveBarProvider>
          <AlertsBody workspaceId={workspaceId} overview={overview} canEdit={canEdit} goalsOn={goalsOn} />
        </SaveBarProvider>
      )}
    </AppShell>
  );
}
