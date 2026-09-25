import { Alert, Button } from "@mantine/core";
import { CalendarClock, MailWarning, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { PageHeader, PageStack } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ReportsSkeleton } from "@/shared/ui/Skeletons";
import { ReportDialog } from "@/features/reports/pages/ReportDialog";
import { useReportsPage, useReportDialog } from "@/features/reports/pages/hooks";
import { nextSendLabel } from "@/features/reports/pages/utils";
import { ReportsTable } from "@/features/reports/components/ReportsTable";
import classes from "@/features/reports/components/Reports.module.css";
import { useTitle } from "@/shared/lib/useTitle";

/**
 * Reports.
 *
 * A table of scheduled reports, with a slim strip of totals above it. Creating
 * or editing opens a full-screen editor with the email a recipient will get
 * drawn next to the form.
 *
 * The page is a shell — data and actions live in `hooks.tsx`, the table and the
 * editor in their own files.
 */
export default function Reports() {
  useTitle("Reports");
  const { t } = useTranslation();
  const { user } = useAuth();
  const { active } = useWorkspace();
  const page = useReportsPage();
  const dialog = useReportDialog({
    waEntitled: page.waEntitled,
    ownerMobile: page.ownerMobile,
    persist: page.persist,
  });

  const paused = page.schedules.length - page.enabled.length;

  return (
    <AppShell>
      <PageStack maxWidth="100%">
        <PageHeader
          title={t("reports.title")}
          description={t("reports.description")}
          docsPath="/email-reports"
          actions={
            <>
              {page.canEdit && page.schedules.length > 0 && (
                <Button leftSection={<Plus size={15} />} onClick={dialog.openNew} disabled={!page.workspaceId}>
                  {t("reports.newReport")}
                </Button>
              )}
              <PageHelpButton />
            </>
          }
        />

        {!page.mailReady && (
          <Alert color="orange" variant="light" icon={<MailWarning size={16} />} radius="md">
            {t("reports.mailNotConfigured")}
          </Alert>
        )}

        {page.isLoading ? (
          <ReportsSkeleton />
        ) : !page.schedules.length ? (
          <div className={classes.card}>
            <EmptyState
              compact
              icon={CalendarClock}
              title={t("reports.emptyTitle")}
              description={t("reports.emptyBodyShort")}
              action={
                page.canEdit
                  ? { label: t("reports.emptyCta"), icon: Plus, onClick: dialog.openNew, disabled: !page.workspaceId }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className={classes.metrics}>
              <div className={classes.metric}>
                <span className={classes.metricLabel}>{t("reports.statActive")}</span>
                <span className={classes.metricValue}>{page.enabled.length}</span>
                <span className={classes.metricHint}>
                  {paused ? t("reports.statActivePaused", { count: paused }) : t("reports.statActiveAllRunning")}
                </span>
              </div>
              <div className={classes.metric}>
                <span className={classes.metricLabel}>{t("reports.statNext")}</span>
                <span className={classes.metricValue}>{page.nextUp ? nextSendLabel(page.nextUp) : "—"}</span>
                <span className={classes.metricHint}>{page.nextUp ? page.nextUp.name : t("reports.statNextNone")}</span>
              </div>
              <div className={classes.metric}>
                <span className={classes.metricLabel}>{t("reports.statReach")}</span>
                <span className={classes.metricValue}>{page.reach}</span>
                <span className={classes.metricHint}>{t("reports.statReachHint")}</span>
              </div>
            </div>

            <div className={classes.card}>
              <ReportsTable
                schedules={page.schedules}
                siteNameFor={page.siteNameFor}
                canEdit={page.canEdit}
                waEntitled={page.waEntitled}
                testingId={page.testing ? page.testingId : null}
                onEdit={dialog.openEdit}
                onTest={page.runTest}
                onTestWhatsApp={page.runWhatsAppTest}
                onToggle={page.toggleEnabled}
                onDelete={page.destroy}
              />
            </div>
          </>
        )}
      </PageStack>

      <ReportDialog
        opened={dialog.opened}
        onClose={dialog.close}
        editingId={dialog.editingId}
        draft={dialog.draft}
        setDraft={dialog.setDraft}
        emailInput={dialog.emailInput}
        setEmailInput={dialog.setEmailInput}
        addEmail={dialog.addEmail}
        removeEmail={dialog.removeEmail}
        tab={dialog.tab}
        focusTick={dialog.focusTick}
        submit={dialog.submit}
        saving={page.saving}
        sites={page.sites}
        share={page.share}
        wa={page.wa}
        waReady={page.waReady}
        waEntitled={page.waEntitled}
        ownerEmail={user?.email ?? ""}
        ownerMobile={page.ownerMobile}
        workspace={active?.name ?? ""}
      />
    </AppShell>
  );
}
