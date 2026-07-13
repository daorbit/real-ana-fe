import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Title, Text, Group, Button, Card, ThemeIcon, Stack, Center, Badge, Progress, Alert,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import {
  Users, Eye, Radio, Globe, BarChart3, FolderKanban, Plus, ArrowUpRight,
  MousePointerClick, Timer, Layers, Globe2, SlidersHorizontal,
  LogIn, LogOut, AppWindow, MonitorSmartphone, Languages, Tag, Pencil, Check, Move,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatCard } from "../components/StatCard";
import { AnalyticsArt } from "../components/Brand";
import { RefreshButton } from "../components/Refresh";
import { WorldMap } from "../components/WorldMap";
import { ClicksPanel } from "../components/ClicksPanel";
import { CustomizeDrawer } from "../components/CustomizeDrawer";
import { SortableWidget, WidgetDragPreview } from "../components/SortableWidget";
import { useStats, useSites, useHomeWidgets, WIDGET_MAP } from "../hooks";
import type { WidgetId, Span } from "../hooks";
import { countryFlag, countryLabel, duration, num } from "../utils";
import { useWorkspace } from "../workspace";
import { notify, errMessage } from "../notify";
import type { Bucket, Stats } from "../types";
import { HomeSkeleton } from "../components/Skeletons";

/* ----------------------------- shared panels ----------------------------- */

function MiniList({
  title, items, icon: Icon, format, empty,
}: {
  title: string;
  items: Bucket[];
  icon: any;
  format?: (key: string) => React.ReactNode;
  empty: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <Icon size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">{title}</Text>
      </Group>
      {items.length === 0 ? (
        <Center py="lg"><Text c="dimmed" size="xs">{empty}</Text></Center>
      ) : (
        <Stack gap="sm">
          {items.slice(0, 6).map((i) => (
            <div key={i.key}>
              <Group justify="space-between" gap="xs" mb={3} wrap="nowrap">
                <Text size="sm" truncate style={{ flex: 1 }}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Text size="sm" fw={700}>{num(i.count)}</Text>
              </Group>
              <Progress value={(i.count / max) * 100} size="xs" radius="xl" color="teal" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}

function TrafficCard({ stats }: { stats: Stats | null }) {
  const series = stats?.timeseries ?? [];
  const hasData = (stats?.pageviews ?? 0) > 0;

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600} size="sm" c="dimmed">Traffic — last 24h</Text>
        <Button component={Link} to="/app/analytics" variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
          Details
        </Button>
      </Group>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted)" }}
            />
            <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2.5} fill="url(#hg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Stack align="center" gap="xs" py="md">
          <AnalyticsArt />
          <Text fw={600} size="sm" mt="sm">No traffic yet</Text>
          <Text c="dimmed" size="xs" ta="center" maw={340}>
            Install the tracking snippet on a site and live visitors will appear here.
          </Text>
          <Button component={Link} to="/app/workspaces" size="xs" variant="light" mt={6} leftSection={<Plus size={14} />}>
            Get tracking snippet
          </Button>
        </Stack>
      )}
    </Card>
  );
}

function LivePagesCard({ stats }: { stats: Stats | null }) {
  const pages = stats?.livePages ?? [];
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={8}>
          <span className="status-dot live" style={{ background: "var(--mantine-color-teal-6)" }} />
          <Text fw={600} c="dimmed" size="sm">Right now</Text>
        </Group>
        <Badge variant="light" color="teal" size="sm">{stats?.live ?? 0}</Badge>
      </Group>
      {pages.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="xs" ta="center">Nobody on the site in the last 5 minutes</Text>
        </Center>
      ) : (
        <Stack gap="xs">
          {pages.map((p) => (
            <Group key={p.key} justify="space-between" gap="xs" wrap="nowrap">
              <Text size="sm" truncate style={{ flex: 1 }}>{p.key}</Text>
              <Badge variant="light" color="gray" size="sm">{p.count}</Badge>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}

/* --------------------------------- page --------------------------------- */

export default function Home() {
  const { active, loading } = useWorkspace();
  const { stats, refresh, refreshing, lastUpdated } = useStats(active?._id, "24h");
  const { sites } = useSites(active?._id);
  const {
    layout, loading: layoutLoading, saving, dirty, save, revert,
    has, spanOf, toggle, remove, setSpan, move, reset, clear,
  } = useHomeWidgets();

  const [customizing, setCustomizing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState<WidgetId | null>(null);

  const sensors = useSensors(
    // A small distance threshold so a click inside a widget isn't read as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = (e: DragStartEvent) => setDragging(e.active.id as WidgetId);

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    move(
      layout.findIndex((p) => p.id === a.id),
      layout.findIndex((p) => p.id === over.id)
    );
  };

  /** Returns whether the save landed, so callers can keep their UI open on failure. */
  const onSave = async (): Promise<boolean> => {
    try {
      await save();
      notify.success("Your layout is saved.", "Layout updated");
      setEditing(false);
      return true;
    } catch (e) {
      // Stay put — the unsaved layout is still on screen to retry.
      notify.error(errMessage(e, "Could not save your layout."));
      return false;
    }
  };

  const onDiscard = () => {
    revert();
    setEditing(false);
  };

  // Show the page shape immediately: while the workspace list loads, and again
  // while the first stats payload is in flight. The layout is waited on too —
  // rendering the defaults first would visibly reshuffle the grid a moment
  // later, once the saved arrangement arrives.
  if (loading || layoutLoading || (active && !stats)) {
    return <AppShell><HomeSkeleton /></AppShell>;
  }

  if (!active) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" size={56} radius="md"><FolderKanban size={28} /></ThemeIcon>
            <Text c="dimmed">No workspace yet. Create one to get started.</Text>
            <Button component={Link} to="/app/workspaces">Go to Workspaces</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const d = stats?.deltas;
  const series = stats?.timeseries ?? [];

  const METRICS: Record<string, any> = {
    visitors: { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors" },
    pageviews: { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views" },
    live: { icon: Radio, label: "Live now", value: stats?.live ?? 0, color: "green", live: true },
    sessions: { icon: Layers, label: "Sessions", value: stats?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null },
    bounce: { icon: MousePointerClick, label: "Bounce rate", value: `${stats?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true },
    avgSession: { icon: Timer, label: "Avg. session", value: duration(stats?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null },
    pagesPerSession: { icon: Layers, label: "Pages / session", value: stats?.pagesPerSession ?? 0, color: "cyan", delta: d?.pagesPerSession ?? null },
    sites: { icon: Globe, label: "Sites", value: sites.length, color: "amber" },
  };

  const flag = (k: string) => (
    <span>
      <span style={{ marginRight: 6 }}>{countryFlag(k)}</span>
      {countryLabel(k)}
    </span>
  );

  const LISTS: Record<string, { title: string; icon: any; items: Bucket[]; empty: string; format?: (k: string) => React.ReactNode }> = {
    topPages: { title: "Top pages", icon: Eye, items: stats?.topPages ?? [], empty: "No pageviews yet" },
    entryPages: { title: "Entry pages", icon: LogIn, items: stats?.entryPages ?? [], empty: "No sessions yet" },
    exitPages: { title: "Exit pages", icon: LogOut, items: stats?.exitPages ?? [], empty: "No completed sessions yet" },
    topReferrers: { title: "Referrers", icon: ArrowUpRight, items: stats?.topReferrers ?? [], empty: "No referrers yet" },
    topCountries: { title: "Countries", icon: Globe2, items: stats?.countries ?? [], empty: "No location data yet", format: flag },
    browsers: { title: "Browsers", icon: AppWindow, items: stats?.browsers ?? [], empty: "No data yet" },
    operatingSystems: { title: "Operating systems", icon: MonitorSmartphone, items: stats?.operatingSystems ?? [], empty: "No data yet" },
    devices: { title: "Devices", icon: MonitorSmartphone, items: stats?.devices ?? [], empty: "No data yet" },
    screenSizes: { title: "Screen sizes", icon: MonitorSmartphone, items: stats?.screenSizes ?? [], empty: "No data yet" },
    languages: { title: "Languages", icon: Languages, items: stats?.languages ?? [], empty: "No data yet" },
    utmSources: { title: "UTM sources", icon: Tag, items: stats?.utmSources ?? [], empty: "No campaigns yet" },
    utmCampaigns: { title: "UTM campaigns", icon: Tag, items: stats?.utmCampaigns ?? [], empty: "No campaigns yet" },
  };

  /** Render one widget by id. */
  const renderWidget = (id: WidgetId) => {
    if (METRICS[id]) return <StatCard {...METRICS[id]} />;
    if (LISTS[id]) {
      const l = LISTS[id];
      return <MiniList title={l.title} icon={l.icon} items={l.items} empty={l.empty} format={l.format} />;
    }
    if (id === "traffic") return <TrafficCard stats={stats} />;
    if (id === "livePages") return <LivePagesCard stats={stats} />;
    if (id === "worldMap") return <WorldMap countries={stats?.countries ?? []} />;
    if (id === "clicks") return <ClicksPanel clicks={stats?.clicks ?? []} total={stats?.clickCount ?? 0} />;
    return null;
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
        // Keep the drawer open if the save failed, so the edits aren't stranded.
        onSave={async () => {
          if (await onSave()) setCustomizing(false);
        }}
      />

      <Group justify="space-between" align="flex-start" mb="lg">
        <div>
          <Title order={1}>Welcome back 👋</Title>
          <Text c="dimmed" size="sm" mt={6}>
            A quick look at <b>{active.name}</b> — last 24 hours.
          </Text>
        </div>
        <Group gap="sm">
          {!editing && !dirty && (
            <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
          )}

          {/* Widths and widget choices are edited in the drawer, order in edit
              mode — either can leave unsaved work, so Save follows `dirty`
              rather than the mode. */}
          {dirty && (
            <>
              <Button variant="subtle" color="gray" onClick={onDiscard} disabled={saving}>
                Discard
              </Button>
              <Button
                color="emerald"
                leftSection={<Check size={15} />}
                onClick={onSave}
                loading={saving}
              >
                Save changes
              </Button>
            </>
          )}

          {!dirty && (
            <Button
              variant={editing ? "filled" : "default"}
              color={editing ? "emerald" : undefined}
              leftSection={editing ? <Check size={15} /> : <Pencil size={15} />}
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Done" : "Edit layout"}
            </Button>
          )}

          <Button variant="default" leftSection={<SlidersHorizontal size={15} />} onClick={() => setCustomizing(true)}>
            Add widgets
          </Button>

          {!editing && !dirty && (
            <Button component={Link} to="/app/analytics" leftSection={<BarChart3 size={16} />}>
              Full analytics
            </Button>
          )}
        </Group>
      </Group>

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
            <Button size="xs" variant="light" mt={4} onClick={() => setCustomizing(true)}>Add widgets</Button>
          </Stack>
        </Center>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDragging(null)}
        >
          {/* No sorting strategy: the widgets differ wildly in size, and letting
              dnd-kit transform them warps the cards. Items stay put while a
              DragOverlay follows the cursor; the drop just reorders the array. */}
          <SortableContext items={layout.map((p) => p.id)} strategy={undefined}>
            <div className={editing ? "home-grid editing" : "home-grid"}>
              {layout.map((p, i) => (
                <SortableWidget
                  key={p.id}
                  id={p.id}
                  span={p.span}
                  label={WIDGET_MAP[p.id]?.label ?? p.id}
                  editing={editing}
                  onSpan={(s: Span) => setSpan(p.id, s)}
                  onRemove={() => remove(p.id)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }}
                    style={{ height: "100%" }}
                  >
                    {renderWidget(p.id)}
                  </motion.div>
                </SortableWidget>
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {dragging ? (
              <WidgetDragPreview label={WIDGET_MAP[dragging]?.label ?? dragging} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </AppShell>
  );
}
