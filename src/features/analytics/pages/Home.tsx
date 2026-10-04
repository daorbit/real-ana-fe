import { useState } from "react";
import { Link } from "react-router-dom";
import { Text, Group, Button, ThemeIcon, Stack, Center, Alert } from "@mantine/core";
import { BarChart3, FolderKanban, Plus, SlidersHorizontal, Move } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { HomeHero } from "@/features/analytics/components/HomeHero";
import { RefreshButton } from "@/shared/ui/Refresh";
import { DocsButton } from "@/shared/ui/DocsButton";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { SiteFilter } from "@/features/analytics/components/SiteFilter";
import dimClasses from "@/features/analytics/components/layout/ScopeDim.module.css";
import { CustomizeDrawer } from "@/features/analytics/components/CustomizeDrawer";
import { WidgetGrid } from "@/features/analytics/components/widgets/WidgetGrid";
import { WidgetRenderer } from "@/features/analytics/components/widgets/WidgetRenderer";
import { SearchWidgetsProvider } from "@/features/searchConsole/widgets/SearchWidgetsProvider";
import { LayoutEditControls } from "@/features/analytics/components/widgets/LayoutEditControls";
import { Onboarding, onboardingCanShow } from "@/features/auth/components/Onboarding";
import { useStats, useLive, useHomeWidgets, useLinkedInReturn, useSiteScope } from "@/features/analytics";
import { useSites, useSiteInstalled } from "@/features/workspace";
import { useGetSeoReportsQuery, useGetMembersQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { useWorkspace } from "@/features/workspace/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { HomeSkeleton } from "@/shared/ui/Skeletons";
import { useTitle } from "@/shared/lib/useTitle";

export default function Home() {
  useTitle("Home");
  const { active, loading } = useWorkspace();
  const { user } = useAuth();

  useLinkedInReturn();

  const [siteScope, setSiteScope] = useSiteScope(active?._id);

  const { stats, switching, failed, refresh, refreshing, lastUpdated } = useStats(
    active?._id,
    "24h",
    undefined,
    siteScope,
  );

  const { live, livePages, liveCountries, audience } = useLive(active?._id, undefined, siteScope);
  const { sites } = useSites(active?._id);
  const { demo } = useDemo();

  const onboardingVisible = onboardingCanShow();
  const firstSiteId = sites[0]?._id ?? "";
  const firstSiteKey = sites[0]?.siteId ?? "";
  const siteInstalled = useSiteInstalled(
    onboardingVisible && !demo ? active?._id ?? "" : "",
    firstSiteKey,
  );
  const { data: seoReports } = useGetSeoReportsQuery(
    { workspaceId: active?._id ?? "", siteId: firstSiteId, limit: 1 },
    { skip: !onboardingVisible || !active?._id || !firstSiteId || demo },
  );
  const { data: memberData } = useGetMembersQuery(active?._id ?? "", {
    skip: !onboardingVisible || !active?._id || demo,
  });
  const {
    layout, loading: layoutLoading, saving, dirty, save, revert,
    has, spanOf, toggle, remove, setSpan, move, reset, clear,
  } = useHomeWidgets();

  const [customizing, setCustomizing] = useState(false);
  const [editing, setEditing] = useState(false);

  const onSave = async (): Promise<boolean> => {
    try {
      await save();
      notify.success("Your layout is saved.", "Layout updated");
      setEditing(false);
      return true;
    } catch (e) {
      notify.error(errMessage(e, "Could not save your layout."));
      return false;
    }
  };

  const onDiscard = () => {
    revert();
    setEditing(false);
  };

  if (active && !stats && failed && !layoutLoading) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load your overview"
          description="We couldn't reach your analytics just now. Your data is safe — check your connection and try again."
          onRetry={() => void refresh()}
          retrying={refreshing}
        />
      </AppShell>
    );
  }

  if (loading || layoutLoading || (active && !stats)) {
    return <AppShell><HomeSkeleton /></AppShell>;
  }

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderKanban}
          title="No workspace yet"
          description="A workspace holds your sites and everything measured on them. Create one and the tracker snippet is a minute away."
          action={{ label: "Create a workspace", to: "/app/workspaces", icon: Plus }}
          actionNote="Free to start — no card needed."
        />
      </AppShell>
    );
  }

  const widgetData = {
    stats,
    live,
    livePages,
    liveCountries,
    sites,
    siteScope,
    workspaceId: active._id,
  };

  return (
    <AppShell>
      <CustomizeDrawer
        opened={customizing}
        onClose={() => setCustomizing(false)}
        count={layout.length}
        has={has}
        spanOf={spanOf}
        toggle={toggle}
        setSpan={setSpan}
        reset={reset}
        clear={clear}
        dirty={dirty}
        saving={saving}
        onSave={async () => {
          if (await onSave()) setCustomizing(false);
        }}
      />

      <Group justify="flex-end" align="center" mb="md" gap="md" wrap="wrap" className="home-toolbar">
        <Group gap="sm" wrap="wrap" justify="flex-end" className="home-toolbar-btns">

          {!editing && !dirty && (
            <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          )}
          {!editing && !dirty && (
            <SiteFilter sites={sites} selected={siteScope} onChange={setSiteScope} />
          )}

          <LayoutEditControls
            editing={editing}
            dirty={dirty}
            saving={saving}
            onToggleEdit={() => setEditing((v) => !v)}
            onDiscard={onDiscard}
            onSave={onSave}
            onAdd={() => {
              trace(user?.id, "add_widget_clicked", "home", "widget_drawer");
              setCustomizing(true);
            }}
          />

          {!editing && !dirty && (
            <Button
              component={Link}
              to="/app/analytics"
              visibleFrom="sm"
              leftSection={<BarChart3 size={16} />}
              onClick={() => trace(user?.id, "open_analytics_clicked", "home", "analytics")}
            >
              Full analytics
            </Button>
          )}

          <Group gap="sm" wrap="nowrap" visibleFrom="sm">
            {!editing && !dirty && <DocsButton path={DOCS_SLUGS.overview} />}
            <ActivityBellIcon />
          </Group>
        </Group>
      </Group>

      <div className={dimClasses.dim} data-switching={switching || undefined}>
      {!editing && !dirty && (
        <HomeHero
          workspaceName={active.name}
          live={live}
          audience={audience}
          visitors={stats?.visitors ?? 0}
          pageviews={stats?.pageviews ?? 0}
          series={stats?.timeseries ?? []}
        />
      )}

      {!editing && !dirty && !demo && (
        <Onboarding
          hasWorkspace={!!active}
          hasSite={sites.length > 0}
          hasData={siteInstalled === true || (stats?.pageviews ?? 0) > 0}
          snippetSiteId={firstSiteKey || undefined}
          hasAudit={(seoReports?.length ?? 0) > 0}
          hasTeammate={(memberData?.members?.length ?? 0) > 1}
        />
      )}

      {editing && (
        <Alert color="emerald" variant="light" icon={<Move size={16} />} mb="lg">
          <Text size="sm">
            Drag the handle on any widget to move it, and use the number control to set how many
            columns wide it is. Hit <b>Save changes</b> when you're happy with it.
          </Text>
        </Alert>
      )}

      {layout.length === 0 ? (
        <Center mih="40vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="gray" size={52} radius="md"><SlidersHorizontal size={24} /></ThemeIcon>
            <Text fw={600} size="sm">Your home page is empty</Text>
            <Text c="dimmed" size="xs">Choose the widgets you want to see at a glance.</Text>
            <Button
              size="xs"
              variant="light"
              mt={4}
              onClick={() => {
                trace(user?.id, "add_widget_clicked", "home_empty", "widget_drawer");
                setCustomizing(true);
              }}
            >
              Add widgets
            </Button>
          </Stack>
        </Center>
      ) : (
        <SearchWidgetsProvider workspaceId={active._id}>
          <WidgetGrid
            layout={layout}
            editing={editing}
            onMove={move}
            onSpan={setSpan}
            onRemove={remove}
            render={(id) => <WidgetRenderer id={id} data={widgetData} />}
          />
        </SearchWidgetsProvider>
      )}
      </div>
    </AppShell>
  );
}
