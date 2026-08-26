import { useParams, Link } from "react-router-dom";
import { Text, Group, Card, Center, Badge, ThemeIcon, Timeline } from "@mantine/core";
import { ArrowLeft, ArrowRight, MousePointerClick, Users } from "lucide-react";
import { useGetJourneyTimelineQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { dateTime } from "@/shared/lib";

/**
 * One identified user's full journey: every src -> action -> dest step, in
 * the order it actually happened. This is the answer to "which page, which
 * step, which event fired" for a real signed-up user, built entirely from
 * events the app already sent via the Platform API's track endpoint.
 */
export default function JourneyTimeline() {
  const { appUserId } = useParams<{ appUserId: string }>();
  const { active } = useWorkspace();

  const { data, isFetching } = useGetJourneyTimelineQuery(
    { wid: active?._id ?? "", appUserId: appUserId ?? "" },
    { skip: !active || !appUserId },
  );
  const events = data?.events ?? [];

  return (
    <AppShell>
      <PageHeader
        title={appUserId}
        description="Every step this user took, oldest first."
        actions={
          <Text
            component={Link}
            to="/app/journey"
            size="sm"
            c="dimmed"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft size={14} /> All users
          </Text>
        }
      />

      {!isFetching && events.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No events for this user"
          description="Their traced history may have aged out, or the id doesn't match any track() calls yet."
        />
      ) : (
        <Card withBorder radius="lg" padding="lg">
          <Timeline active={events.length} bulletSize={26} lineWidth={2}>
            {events.map((e, i) => (
              <Timeline.Item
                key={i}
                bullet={
                  <ThemeIcon size={22} radius="xl" variant="light" color="emerald">
                    <MousePointerClick size={12} />
                  </ThemeIcon>
                }
                title={<Text fw={600} size="sm">{e.action}</Text>}
              >
                <Group gap={6} mt={2} wrap="wrap">
                  {e.src && <Badge variant="light" color="gray" radius="sm">{e.src}</Badge>}
                  {e.src && e.dest && <ArrowRight size={12} />}
                  {e.dest && <Badge variant="light" color="emerald" radius="sm">{e.dest}</Badge>}
                </Group>
                <Text size="xs" c="dimmed" mt={4}>{dateTime(e.ts)}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {isFetching && events.length === 0 && (
        <Center mih="30vh">
          <Text size="sm" c="dimmed">Loading…</Text>
        </Center>
      )}
    </AppShell>
  );
}
