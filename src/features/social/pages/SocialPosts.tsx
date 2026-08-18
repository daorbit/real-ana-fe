import { useMemo, useRef, useState } from "react";
import {
  Alert, Badge, Box, Button, Card, FileButton, Group, Loader, Modal, NumberInput,
  Select, Stack, Text, Textarea, TextInput, Title, Tooltip,
} from "@mantine/core";
import {
  CalendarClock, CheckCircle2, ExternalLink, Image as ImageIcon, Pause,
  Play, Plus, Trash2, TriangleAlert, X,
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
import type { PostFrequency, ScheduledPost } from "@/shared/types";

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

const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

const FREQUENCIES = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];

/** LinkedIn's commentary cap. */
const MAX_CAPTION = 3000;
const MAX_IMAGE_MB = 8;

/** A draft in the composer. Mirrors the create payload. */
type Draft = {
  name: string;
  caption: string;
  /** A data URL for a new upload, an https URL for one already stored, or "". */
  image: string;
  frequency: PostFrequency;
  hour: number;
  minute: number;
  weekday: number;
  dayOfMonth: number;
};

function emptyDraft(): Draft {
  return {
    name: "",
    caption: "",
    image: "",
    frequency: "weekly",
    hour: 9,
    minute: 0,
    weekday: 1,
    dayOfMonth: 1,
  };
}

/** Read a picked file as the base64 data URL the API expects. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read that file"));
    reader.readAsDataURL(file);
  });
}

/** "Every week on Monday at 09:00" — the cadence as a sentence. */
function describe(post: Pick<ScheduledPost, "frequency" | "hour" | "minute" | "weekday" | "dayOfMonth">) {
  const time = `${String(post.hour).padStart(2, "0")}:${String(post.minute).padStart(2, "0")}`;
  if (post.frequency === "daily") return `Every day at ${time}`;
  if (post.frequency === "weekly") {
    const day = WEEKDAYS.find((d) => d.value === String(post.weekday))?.label ?? "Monday";
    return `Every week on ${day} at ${time}`;
  }
  return `Every month on day ${post.dayOfMonth} at ${time}`;
}

export default function SocialPosts() {
  const { active } = useWorkspace();
  const { data, isLoading, refetch } = useGetScheduledPostsQuery();
  const [create, { isLoading: creating }] = useCreateScheduledPostMutation();
  const [update] = useUpdateScheduledPostMutation();
  const [remove] = useDeleteScheduledPostMutation();

  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const resetImage = useRef<() => void>(null);
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
  // A schedule cannot publish without a live connection, so the composer is
  // held shut rather than letting someone write a post that will only fail.
  const ready = Boolean(linkedin?.connected && !linkedin.expired);

  const pickImage = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      notify.error(`Image must be ${MAX_IMAGE_MB}MB or smaller.`);
      resetImage.current?.();
      return;
    }
    try {
      // Read first, then set: the updater passed to `setDraft` is synchronous.
      const dataUrl = await readAsDataUrl(file);
      setDraft((d) => ({ ...d, image: dataUrl }));
    } catch {
      notify.error("Could not read that image.");
    }
  };

  const submit = async () => {
    if (!active?._id) return notify.error("Pick a workspace first.");
    if (!draft.caption.trim()) return notify.error("Caption cannot be empty.");

    try {
      await create({
        workspaceId: active._id,
        name: draft.name.trim() || "Scheduled post",
        caption: draft.caption,
        image: draft.image || undefined,
        frequency: draft.frequency,
        hour: draft.hour,
        minute: draft.minute,
        timezone,
        weekday: draft.weekday,
        dayOfMonth: draft.dayOfMonth,
      }).unwrap();

      notify.success("Schedule created.");
      setComposing(false);
      setDraft(emptyDraft());
    } catch (e) {
      notify.error(errMessage(e, "Could not save that schedule."));
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
              onClick={() => setComposing(true)}
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
                : "Connect your LinkedIn account to start scheduling posts."}
            </Text>
            <Button
              size="compact-sm"
              loading={connecting}
              onClick={connect}
              style={{ background: "#0A66C2", color: "#fff", flexShrink: 0 }}
            >
              {linkedin?.expired ? "Reconnect LinkedIn" : "Connect LinkedIn"}
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

      <Modal
        opened={composing}
        onClose={() => setComposing(false)}
        title="New scheduled post"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            description="For your own list. Not published."
            placeholder="Weekly analytics update"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
          />

          <Textarea
            label="Caption"
            placeholder="What should this post say?"
            autosize
            minRows={5}
            maxRows={14}
            required
            maxLength={MAX_CAPTION}
            value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.currentTarget.value })}
            description={`${draft.caption.length} / ${MAX_CAPTION}`}
          />

          <div>
            <Text size="sm" fw={500} mb={6}>Image <Text span c="dimmed" fw={400}>(optional)</Text></Text>
            {draft.image ? (
              <Group gap="sm" wrap="nowrap">
                <img
                  src={draft.image}
                  alt=""
                  style={{ width: 140, height: 79, objectFit: "cover", borderRadius: 6 }}
                />
                <Button
                  variant="subtle"
                  size="compact-sm"
                  leftSection={<X size={14} />}
                  onClick={() => {
                    setDraft({ ...draft, image: "" });
                    resetImage.current?.();
                  }}
                >
                  Remove
                </Button>
              </Group>
            ) : (
              <FileButton
                resetRef={resetImage}
                accept="image/png,image/jpeg,image/webp"
                onChange={pickImage}
              >
                {(props) => (
                  <Button {...props} variant="default" leftSection={<ImageIcon size={15} />}>
                    Upload image
                  </Button>
                )}
              </FileButton>
            )}
          </div>

          <Select
            label="Repeat"
            data={FREQUENCIES}
            value={draft.frequency}
            allowDeselect={false}
            onChange={(v) => setDraft({ ...draft, frequency: (v as PostFrequency) ?? "weekly" })}
          />

          {/* Only the field the chosen cadence actually uses is shown — a day
              picker beside a daily schedule is a control that does nothing. */}
          {draft.frequency === "weekly" && (
            <Select
              label="Day of week"
              data={WEEKDAYS}
              value={String(draft.weekday)}
              allowDeselect={false}
              onChange={(v) => setDraft({ ...draft, weekday: Number(v ?? 1) })}
            />
          )}

          {draft.frequency === "monthly" && (
            <NumberInput
              label="Day of month"
              description="1–28, so every month has the day."
              min={1}
              max={28}
              value={draft.dayOfMonth}
              onChange={(v) => setDraft({ ...draft, dayOfMonth: Number(v) || 1 })}
            />
          )}

          <Group grow>
            <NumberInput
              label="Hour"
              min={0}
              max={23}
              value={draft.hour}
              onChange={(v) => setDraft({ ...draft, hour: Number(v) || 0 })}
            />
            <NumberInput
              label="Minute"
              min={0}
              max={59}
              value={draft.minute}
              onChange={(v) => setDraft({ ...draft, minute: Number(v) || 0 })}
            />
          </Group>

          <Text size="xs" c="dimmed">
            {describe(draft)} · {timezone}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setComposing(false)}>Cancel</Button>
            <Button loading={creating} onClick={submit} disabled={!draft.caption.trim()}>
              Create schedule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}
