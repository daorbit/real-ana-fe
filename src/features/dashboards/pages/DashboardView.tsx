import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ActionIcon, Alert, Button, Loader, Menu, Text } from "@mantine/core";
import { ChevronLeft, Code2, Copy, LayoutGrid, MoreHorizontal, Move, SearchX, SlidersHorizontal, Trash2 } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RefreshButton } from "@/shared/ui/Refresh";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import { HomeSkeleton } from "@/shared/ui/Skeletons";
import { useTitle } from "@/shared/lib/useTitle";
import { errMessage, notify } from "@/shared/lib/notify";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useSites } from "@/features/workspace";
import { useStats, useLive, useSiteScope, isEmbeddable } from "@/features/analytics";
import { isSearchWidget } from "@/features/analytics/widgetCatalog";
import { SearchWidgetsProvider } from "@/features/searchConsole/widgets/SearchWidgetsProvider";
import { SearchConnectionBanner } from "@/features/searchConsole/widgets/SearchConnectionBanner";
import { SiteFilter } from "@/features/analytics/components/SiteFilter";
import { CustomizeDrawer } from "@/features/analytics/components/CustomizeDrawer";
import { WidgetGrid } from "@/features/analytics/components/widgets/WidgetGrid";
import { WidgetRenderer } from "@/features/analytics/components/widgets/WidgetRenderer";
import { LayoutEditControls } from "@/features/analytics/components/widgets/LayoutEditControls";
import { useGetDashboardQuery } from "@/features/dashboards/api";
import { useDashboardLayout } from "@/features/dashboards/hooks/useDashboardLayout";
import { useDashboardRange } from "@/features/dashboards/hooks/useDashboardRange";
import { useDashboardActions } from "@/features/dashboards/hooks/useDashboardActions";
import { DashboardTitle } from "@/features/dashboards/components/DashboardTitle";
import { RangeControl } from "@/features/dashboards/components/RangeControl";
import { WidgetFrame } from "@/features/dashboards/components/WidgetFrame";
import { EmbedModal } from "@/features/dashboards/components/embeds/EmbedModal";
import { rangeLong } from "@/features/dashboards/types";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import type { WidgetId } from "@/features/analytics";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export default function DashboardView() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id;

  const { data: dashboard, isLoading, isError } = useGetDashboardQuery(
    { workspaceId: workspaceId ?? "", id },
    { skip: !workspaceId || !id }
  );
  useTitle(dashboard?.name ?? "Dashboard");

  const layout = useDashboardLayout(workspaceId, dashboard);
  const { range, chosen, limited, allowed, change } = useDashboardRange(dashboard, canEdit, (r) => {
    layout.patch({ range: r }).catch((e) => notify.error(errMessage(e, "Could not save the range.")));
  });

  const [siteScope, setSiteScope] = useSiteScope(workspaceId);
  const { stats, refresh, refreshing, refetching, lastUpdated } = useStats(workspaceId, range, undefined, siteScope);
  const { live, livePages, liveCountries } = useLive(workspaceId, undefined, siteScope);
  const { sites } = useSites(workspaceId);
  const { duplicateDashboard, deleteDashboard } = useDashboardActions(workspaceId);

  const [editing, setEditing] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [embedWidget, setEmbedWidget] = useState<WidgetId | null>(null);

  useEffect(() => {
    if (params.get("customize") !== "1" || !dashboard || !canEdit) return;
    setCustomizing(true);
    setParams({}, { replace: true });
  }, [params, dashboard, canEdit, setParams]);

  useEffect(() => {
    setEditing(false);
    setCustomizing(false);
  }, [id]);

  if (!workspaceId || isLoading) return <AppShell><HomeSkeleton /></AppShell>;

  if (isError || !dashboard) {
    return (
      <AppShell>
        <EmptyState
          icon={SearchX}
          title="Dashboard not found"
          description="It may have been deleted, or it belongs to a different workspace."
          action={{ label: "All dashboards", to: "/app/dashboards", icon: LayoutGrid }}
        />
      </AppShell>
    );
  }

  const save = async (): Promise<boolean> => {
    try {
      await layout.save();
      notify.success("Your layout is saved.", "Dashboard updated");
      setEditing(false);
      return true;
    } catch (e) {
      notify.error(errMessage(e, "Could not save the layout."));
      return false;
    }
  };

  const discard = () => {
    layout.revert();
    setEditing(false);
  };

  const rename = (name: string) =>
    layout
      .patch({ name })
      .then(() => true)
      .catch((e) => {
        notify.error(errMessage(e, "Could not rename the dashboard."));
        return false;
      });

  const widgetData = {
    stats,
    live,
    livePages,
    liveCountries,
    sites,
    siteScope,
    workspaceId,
    trafficTitle: `Traffic — ${rangeLong(range)}`,
    range,
  };
  const hasSearch = layout.layout.some((p) => isSearchWidget(p.id));

  const quiet = !editing && !layout.dirty;
  const template = TEMPLATE_MAP[dashboard.template] ?? TEMPLATE_MAP.blank;

  return (
    <AppShell>
      <CustomizeDrawer
        opened={customizing}
        onClose={() => setCustomizing(false)}
        title={`Customize “${dashboard.name}”`}
        intro="Pick the widgets this dashboard should show. Changes stay local until you save them."
        showReset={layout.hasDefaults}
        count={layout.layout.length}
        has={layout.has}
        spanOf={layout.spanOf}
        toggle={layout.toggle}
        setSpan={layout.setSpan}
        reset={layout.reset}
        clear={layout.clear}
        dirty={layout.dirty}
        saving={layout.saving}
        onSave={async () => {
          if (await save()) setCustomizing(false);
        }}
      />

      <div className={classes.viewHead}>
        <div className={`${classes.viewIntro} ${classes.accent}`} data-accent={template.accent}>
          <Link to="/app/dashboards" className={classes.crumb}>
            <ChevronLeft size={14} /> Dashboards
          </Link>
          <DashboardTitle name={dashboard.name} icon={template.icon} canEdit={canEdit} onRename={rename} />
          <div className={classes.subtitle}>
            {dashboard.description || `${layout.layout.length} widgets · ${rangeLong(range)}`}
          </div>
          {limited && (
            <div className={classes.rangeNote}>
              Showing the last 24 hours — {chosen} needs a plan that includes longer ranges.
            </div>
          )}
        </div>

        <div className={classes.viewActions}>
          {quiet && refetching && !refreshing && (
            <span className={classes.updating}><Loader size={12} color="gray" /> Updating…</span>
          )}
          {quiet && <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />}
          {quiet && <SiteFilter sites={sites} selected={siteScope} onChange={setSiteScope} />}
          {quiet && <RangeControl value={range} allowed={allowed} onChange={change} />}
          {canEdit && (
            <LayoutEditControls
              editing={editing}
              dirty={layout.dirty}
              saving={layout.saving}
              onToggleEdit={() => setEditing((v) => !v)}
              onDiscard={discard}
              onSave={save}
              onAdd={() => setCustomizing(true)}
            />
          )}
          {canEdit && quiet && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="default" size="lg" aria-label="More actions">
                  <MoreHorizontal size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<Code2 size={14} />} onClick={() => setEmbedWidget(layout.layout.find((p) => isEmbeddable(p.id))?.id ?? "visitors")}>
                  Embed a widget
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => duplicateDashboard(dashboard, true)}>
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<Trash2 size={14} />}
                  color="red"
                  onClick={() => deleteDashboard(dashboard, () => navigate("/app/dashboards"))}
                >
                  Delete dashboard
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <ActivityBellIcon />
        </div>
      </div>

      {editing && (
        <Alert color="emerald" variant="light" icon={<Move size={16} />} mb="lg">
          <Text size="sm">
            Drag the handle on any widget to move it, and use the number control to set how many
            columns wide it is. Hit <b>Save changes</b> when you're happy with it.
          </Text>
        </Alert>
      )}

      {layout.layout.length === 0 ? (
        <div className={classes.emptyCanvas}>
          <span className={classes.newIcon}><SlidersHorizontal size={18} /></span>
          <Text fw={600}>This dashboard is empty</Text>
          <Text size="sm" c="dimmed" maw={360}>
            Add charts, KPIs and breakdowns. Everything on Home and in Analytics is available here.
          </Text>
          {canEdit && (
            <Button color="emerald" mt={6} leftSection={<SlidersHorizontal size={15} />} onClick={() => setCustomizing(true)}>
              Add widgets
            </Button>
          )}
        </div>
      ) : (
        <SearchWidgetsProvider workspaceId={workspaceId}>
          {hasSearch && !editing && (
            <SearchConnectionBanner workspaceId={workspaceId} sites={sites} siteScope={siteScope} range={range} />
          )}
          <WidgetGrid
            layout={layout.layout}
            editing={editing}
            onMove={layout.move}
            onSpan={layout.setSpan}
            onRemove={layout.remove}
            render={(wid) => (
              <WidgetFrame onEmbed={canEdit && !editing && isEmbeddable(wid) ? () => setEmbedWidget(wid) : undefined}>
                <WidgetRenderer id={wid} data={widgetData} />
              </WidgetFrame>
            )}
          />
        </SearchWidgetsProvider>
      )}

      <EmbedModal
        opened={embedWidget !== null}
        workspaceId={workspaceId}
        embedId={null}
        initialWidget={embedWidget}
        initialRange={range}
        onClose={() => setEmbedWidget(null)}
      />
    </AppShell>
  );
}
