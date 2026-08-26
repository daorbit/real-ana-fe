import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Text, Group, Card, ThemeIcon, SegmentedControl, Stack, Code,
  CopyButton, ActionIcon, Tooltip, Skeleton,
} from "@mantine/core";
import {
  ArrowLeft, Users, Copy, Check, Workflow, ListOrdered, GitBranch, Braces,
  RotateCw, PieChart,
} from "lucide-react";
import { useGetJourneyTimelineQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { dateTime } from "@/shared/lib";
import {
  actionOptions, applyFilters, EMPTY_FILTERS, gapLabel,
  type JourneyFilters,
} from "@/features/journey/lib/deriveJourney";
import { JourneyFilterBar } from "@/features/journey/components/JourneyFilterBar";
import { JourneyFlowView } from "@/features/journey/components/JourneyFlowView";
import { JourneySequenceView } from "@/features/journey/components/JourneySequenceView";
import { JourneyTimelineView } from "@/features/journey/components/JourneyTimelineView";
import { JourneySunburstView } from "@/features/journey/components/JourneySunburstView";

/**
 * The formats a journey can be read in.
 *
 * Kept as data rather than a switch buried in the render, so adding another
 * reading later is one entry here plus its component — the same reason the
 * nav rail keeps its items in a list.
 */
const VIEWS = [
  { value: "flow", label: "Flow", icon: Workflow },
  { value: "sequence", label: "Sequence", icon: GitBranch },
  { value: "timeline", label: "Timeline", icon: ListOrdered },
  { value: "sunburst", label: "Paths", icon: PieChart },
  { value: "json", label: "JSON", icon: Braces },
] as const;

type ViewId = (typeof VIEWS)[number]["value"];

/**
 * One identified user's full journey, in whichever reading suits the
 * question: the graph for shape, the sequence for order, the list for detail,
 * the sunburst for branching, the raw payload for debugging what the app
 * actually sent.
 *
 * The filters sit above the switcher and feed all five, so switching reading
 * never silently changes what you are looking at.
 */
export default function JourneyTimeline() {
  const { appUserId } = useParams<{ appUserId: string }>();
  const { active } = useWorkspace();
  const [view, setView] = useState<ViewId>("flow");
  const [filters, setFilters] = useState<JourneyFilters>(EMPTY_FILTERS);
  // Which step the diagrams have highlighted, and what the JSON panel shows.
  // Null means "nothing picked yet", which reads as the latest step.
  const [selected, setSelected] = useState<number | null>(null);

  const { data, isFetching, refetch } = useGetJourneyTimelineQuery(
    { wid: active?._id ?? "", appUserId: appUserId ?? "" },
    { skip: !active || !appUserId },
  );
  const events = useMemo(() => data?.events ?? [], [data]);

  const options = useMemo(() => actionOptions(events), [events]);
  const steps = useMemo(() => applyFilters(events, filters), [events, filters]);

  const shown = selected ?? (steps.length ? steps.length - 1 : null);
  const current = shown !== null ? steps[shown] : undefined;

  const span = events.length
    ? new Date(events[events.length - 1].ts).getTime() - new Date(events[0].ts).getTime()
    : 0;

  return (
    <AppShell>
      <PageHeader
        title={appUserId}
        description={
          events.length
            ? `${events.length} steps over ${gapLabel(span)} · first seen ${dateTime(events[0].ts)}`
            : "Every step this user took, oldest first."
        }
        actions={
          <Group gap="sm" wrap="nowrap">
            <Tooltip label="Refresh" withArrow>
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => refetch()}
                aria-label="Refresh"
              >
                <RotateCw size={16} className={isFetching ? "spin" : undefined} />
              </ActionIcon>
            </Tooltip>
            <Text
              component={Link}
              to="/app/journey"
              size="sm"
              c="dimmed"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={14} /> All users
            </Text>
          </Group>
        }
      />

      {isFetching ? (
        <Stack gap="md">
          <Skeleton height={36} radius="md" />
          <Skeleton height={36} width={420} radius="md" />
          <Skeleton height={420} radius="lg" />
        </Stack>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No events for this user"
          description="Their traced history may have aged out, or the id doesn't match any trace() calls yet."
        />
      ) : (
        <Stack gap="md">
          <JourneyFilterBar
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              // The selection is an index into the filtered list, so a new
              // filter would otherwise leave it pointing at a different step.
              setSelected(null);
            }}
            options={options}
            total={events.length}
            showing={steps.length}
          />

          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as ViewId)}
            data={VIEWS.map((v) => ({
              value: v.value,
              label: (
                <Group gap={6} wrap="nowrap" justify="center">
                  <v.icon size={14} />
                  <span>{v.label}</span>
                </Group>
              ),
            }))}
            w="fit-content"
          />

          {steps.length === 0 ? (
            <EmptyState
              compact
              icon={Users}
              title="No steps match these filters"
              description="Widen the date range, or clear the action filter."
            />
          ) : (
            <Card withBorder radius="lg" padding={view === "flow" ? 0 : "lg"}>
              {view === "flow" && <JourneyFlowView steps={steps} />}
              {view === "sequence" && (
                <JourneySequenceView
                  steps={steps}
                  selectedIndex={selected}
                  onSelect={setSelected}
                />
              )}
              {view === "timeline" && (
                <JourneyTimelineView
                  steps={steps}
                  selectedIndex={selected}
                  onSelect={setSelected}
                />
              )}
              {view === "sunburst" && <JourneySunburstView steps={steps} />}
              {view === "json" && (
                <Code block style={{ maxHeight: 460, overflow: "auto" }}>
                  {JSON.stringify(steps, null, 2)}
                </Code>
              )}
            </Card>
          )}

          {/* The selected step's raw payload — what the app actually sent.
              Shown beside every diagram rather than only in the JSON view, so
              picking a step in a diagram answers "and what was in it?"
              without switching away from the picture. */}
          {view !== "json" && view !== "sunburst" && current && (
            <Card withBorder radius="lg" padding="md">
              <Group justify="space-between" mb="xs" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="gray" size="sm" radius="sm">
                    <Braces size={13} />
                  </ThemeIcon>
                  <Text size="xs" fw={600}>
                    Step {(shown ?? 0) + 1} of {steps.length}
                  </Text>
                </Group>
                <CopyButton value={JSON.stringify(current, null, 2)}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied" : "Copy step"} withArrow>
                      <ActionIcon variant="subtle" color="gray" onClick={copy} aria-label="Copy step">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Code block>
                {JSON.stringify(
                  {
                    src: current.src,
                    dest: current.dest,
                    action: current.action,
                    at: current.ts,
                    ...(current.repeats > 1 ? { repeats: current.repeats } : {}),
                  },
                  null,
                  2,
                )}
              </Code>
            </Card>
          )}
        </Stack>
      )}
    </AppShell>
  );
}
