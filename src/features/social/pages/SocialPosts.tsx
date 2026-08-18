import { useMemo, useState } from "react";
import {
  Alert, Badge, Box, Button, Card, Group, Loader, Stack, Text, Title, Tooltip,
} from "@mantine/core";
import {
  CalendarClock, CheckCircle2, ExternalLink, Pause,
  Pencil, Play, Plus, Trash2, TriangleAlert,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useWorkspace } from "@/features/workspace/context";
import { notify, errMessage } from "@/shared/lib/notify";
import {
  useGetScheduledPostsQuery,
  useCreateScheduledPostMutation,
  useUpdateScheduledPostMutation,
  useDeleteScheduledPostMutation,
  useDisconnectLinkedInMutation,
} from "@/app/store";
import { useLinkedInConnect } from "@/features/social/useLinkedInConnect";
import { PostComposer } from "@/features/social/components/PostComposer";
import {
  describe, draftFromPost, emptyDraft, type Draft,
} from "@/features/social/components/draft";
import type { ScheduledPost } from "@/shared/types";

/**
 * Scheduled LinkedIn posts.
 *
 * The post is written here in full — caption and image both — and stored as
 * finished content. The server publishes it unchanged on the cadence chosen,
 * which is the property that makes this predictable: what is composed on this
 * page is exactly what appears in the feed, with nothing generated in between.
 *
 * The image is uploaded to Cloudinary server-side from a base64 data URL, the
 * same path avatars already take.
 */

export default function SocialPosts() {
  const { active } = useWorkspace();
  const { data, isLoading, refetch } = useGetScheduledPostsQuery();
  const [create, { isLoading: creating }] = useCreateScheduledPostMutation();
  const [update, { isLoading: updating }] = useUpdateScheduledPostMutation();
  const [remove] = useDeleteScheduledPostMutation();

  const [composing, setComposing] = useState(false);
  // The post the composer is editing, or null when it is writing a new one.
  const [editing, setEditing] = useState<ScheduledPost | null>(null);
  // What the composer opens with. Held here rather than derived inside it, so
  // "Save & add another" can keep the cadence while the content clears.
  const [initial, setInitial] = useState<Draft>(emptyDraft);
  // Connecting happens in a popup, so this page — and any half-written draft —
  // survives the round trip. `refetch` picks up the new connection state.
  const { connect, connecting } = useLinkedInConnect(refetch);
  const [disconnect, { isLoading: disconnecting }] = useDisconnectLinkedInMutation();

  /**
   * Drop the connection.
   *
   * Existing schedules are deliberately left in place rather than deleted: the
   * posts someone wrote are still theirs, and reconnecting should resume them
   * rather than make them start over. They simply stop publishing until there
   * is an account to publish as.
   */
  const disconnectLinkedIn = async () => {
    try {
      await disconnect().unwrap();
      notify.success("LinkedIn disconnected. Your schedules are paused until you reconnect.");
      refetch();
    } catch (e) {
      notify.error(errMessage(e, "Could not disconnect LinkedIn."));
    }
  };

  // The zone the schedule is written in. Taken from the browser so "9am" means
  // 9am where the author is, which is what the server stores and honours.
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const linkedin = data?.linkedin;
  const posts = data?.posts ?? [];
  // A schedule cannot publish without a live connection that is allowed to
  // post, so the composer is held shut rather than letting someone write a post
  // that will only fail. `canPublish` is false for an account that signed in
  // with LinkedIn but never granted publishing — sign-in no longer asks for it.
  const ready = Boolean(linkedin?.connected && !linkedin.expired && linkedin.canPublish !== false);
  // Connected, but only for identity. Needs the publishing consent, not a whole
  // new connection — worth saying differently from "not connected at all".
  const needsPostingPermission = Boolean(
    linkedin?.connected && !linkedin.expired && linkedin.canPublish === false,
  );

  const openNew = () => {
    setEditing(null);
    setInitial(emptyDraft());
    setComposing(true);
  };

  const openEdit = (post: ScheduledPost) => {
    setEditing(post);
    setInitial(draftFromPost(post));
    setComposing(true);
  };

  /**
   * Create or update, depending on what the composer was opened with.
   *
   * Returns whether it saved: the composer clears for the next post on true and
   * keeps the draft on screen on false, so a failure never loses what was
   * written.
   */
  const save = async (draft: Draft): Promise<boolean> => {
    if (!active?._id) {
      notify.error("Pick a workspace first.");
      return false;
    }
    if (!draft.caption.trim()) {
      notify.error("The post cannot be empty.");
      return false;
    }

    const fields = {
      name: draft.name.trim() || "Scheduled post",
      caption: draft.caption,
      frequency: draft.frequency,
      hour: draft.hour,
      minute: draft.minute,
      timezone,
      weekday: draft.weekday,
      dayOfMonth: draft.dayOfMonth,
    };

    try {
      if (editing) {
        // An unchanged image is sent back as the https URL it already is, which
        // the server takes as "leave it alone" — only a data URL is re-uploaded.
        await update({ id: editing.id, image: draft.image, ...fields }).unwrap();
        notify.success("Schedule updated.");
      } else {
        await create({
          workspaceId: active._id,
          image: draft.image || undefined,
          ...fields,
        }).unwrap();
        notify.success("Schedule created.");
      }
      return true;
    } catch (e) {
      notify.error(errMessage(e, "Could not save that schedule."));
      return false;
    }
  };

  const toggle = async (post: ScheduledPost) => {
    const next = post.status === "active" ? "paused" : "active";
    try {
      await update({ id: post.id, status: next }).unwrap();
      notify.success(next === "active" ? "Schedule resumed." : "Schedule paused.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update that schedule."));
    }
  };

  const destroy = async (post: ScheduledPost) => {
    try {
      await remove(post.id).unwrap();
      notify.success("Schedule deleted.");
    } catch (e) {
      notify.error(errMessage(e, "Could not delete that schedule."));
    }
  };

  return (
    <AppShell>
      <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
        <div>
          <Title order={2}>Scheduled posts</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Write a post once and have it published to your LinkedIn profile on a repeating schedule.
          </Text>
        </div>
        <Tooltip label="Connect LinkedIn first" disabled={ready} withArrow>
          <Box>
            <Button
              leftSection={<Plus size={16} />}
              disabled={!ready}
              onClick={openNew}
            >
              New schedule
            </Button>
          </Box>
        </Tooltip>
      </Group>

      {/* The connection is the precondition for everything on this page, so its
          state is stated once at the top rather than repeated on each row — and
          it carries the button that fixes it. Sending someone to another page to
          connect makes the thing they came here to do a two-stop errand. */}
      {!isLoading && !ready && (
        <Alert
          color={linkedin?.expired ? "orange" : "blue"}
          variant="light"
          icon={<TriangleAlert size={18} />}
          mb="lg"
        >
          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Text size="sm">
              {linkedin?.expired
                ? "Your LinkedIn connection has expired. Reconnect it to resume publishing."
                : needsPostingPermission
                  ? "Your LinkedIn account is connected for sign-in. Allow posting to schedule posts from here."
                  : "Connect your LinkedIn account to start scheduling posts."}
            </Text>
            <Button
              size="compact-sm"
              loading={connecting}
              onClick={connect}
              style={{ background: "#0A66C2", color: "#fff", flexShrink: 0 }}
            >
              {linkedin?.expired
                ? "Reconnect LinkedIn"
                : needsPostingPermission
                  ? "Allow posting"
                  : "Connect LinkedIn"}
            </Button>
          </Group>

          {/* LinkedIn's consent screen asks for create/modify/delete — the reach
              of the one permission it offers for publishing, not what this app
              does. Better heard from us beforehand than read cold there. */}
          {!linkedin?.expired && (
            <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
              LinkedIn will ask you to allow creating, modifying and deleting posts — that is
              the wording of the single permission it offers for publishing. Quantalog only
              ever creates the posts you schedule here. It never edits or deletes anything on
              your profile.
            </Text>
          )}
        </Alert>
      )}

      {/* Connected: say who these posts go out as, and keep the account
          reachable. Without this the connection is only changeable from the
          Share panel, which is a strange place to have to go to disconnect
          something this page depends on. */}
      {ready && (
        <Group justify="space-between" align="center" wrap="nowrap" mb="lg" gap="md">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <CheckCircle2 size={15} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
            <Text size="sm" c="dimmed" truncate>
              Publishing as <strong>{linkedin?.name}</strong> · times shown in {timezone}
            </Text>
          </Group>
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            loading={disconnecting}
            onClick={disconnectLinkedIn}
            style={{ flexShrink: 0 }}
          >
            Disconnect
          </Button>
        </Group>
      )}


      {isLoading ? (
        <Group justify="center" py="xl"><Loader /></Group>
      ) : posts.length === 0 ? (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="xs">
            <CalendarClock size={28} style={{ color: "var(--mantine-color-dimmed)" }} />
            <Text fw={600}>No scheduled posts yet</Text>
            <Text size="sm" c="dimmed" ta="center">
              Create one and it will publish automatically on the cadence you choose.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {posts.map((post) => (
            <Card key={post.id} withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group align="flex-start" gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      style={{ width: 96, height: 54, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                    />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Group gap={8} wrap="nowrap" mb={4}>
                      <Text fw={600} truncate>{post.name}</Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={post.status === "active" ? "teal" : "gray"}
                      >
                        {post.status === "active" ? "Active" : "Paused"}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={2} mb={6}>
                      {post.caption}
                    </Text>

                    <Text size="xs" c="dimmed">
                      {describe(post)}
                      {post.status === "active" && (
                        <> · next {new Date(post.nextRunAt).toLocaleString()}</>
                      )}
                      {post.postCount > 0 && <> · {post.postCount} published</>}
                    </Text>

                    {/* The last outcome, when there was one. A failure carries
                        the reason the server already wrote for display. */}
                    {post.lastStatus === "failed" && post.lastError && (
                      <Group gap={6} mt={6} wrap="nowrap">
                        <TriangleAlert size={13} style={{ color: "var(--mantine-color-orange-6)", flexShrink: 0 }} />
                        <Text size="xs" c="orange">{post.lastError}</Text>
                      </Group>
                    )}
                    {post.lastStatus === "ok" && (
                      <Group gap={6} mt={6} wrap="nowrap">
                        <CheckCircle2 size={13} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
                        <Text size="xs" c="dimmed">
                          Last published {post.lastRunAt ? new Date(post.lastRunAt).toLocaleString() : ""}
                        </Text>
                        {post.lastPostUrl && (
                          <Button
                            component="a"
                            href={post.lastPostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="subtle"
                            size="compact-xs"
                            rightSection={<ExternalLink size={12} />}
                          >
                            View
                          </Button>
                        )}
                      </Group>
                    )}
                  </div>
                </Group>

                <Group gap={6} wrap="nowrap">
                  <Tooltip label="Edit" withArrow>
                    <Button variant="default" size="compact-sm" onClick={() => openEdit(post)}>
                      <Pencil size={14} />
                    </Button>
                  </Tooltip>
                  <Tooltip label={post.status === "active" ? "Pause" : "Resume"} withArrow>
                    <Button variant="default" size="compact-sm" onClick={() => toggle(post)}>
                      {post.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                  </Tooltip>
                  <Tooltip label="Delete" withArrow>
                    <Button variant="default" size="compact-sm" onClick={() => destroy(post)}>
                      <Trash2 size={14} />
                    </Button>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <PostComposer
        opened={composing}
        onClose={() => setComposing(false)}
        initial={initial}
        editing={editing}
        author={linkedin?.name ?? ""}
        timezone={timezone}
        saving={creating || updating}
        onSave={save}
      />

    </AppShell>
  );
}
