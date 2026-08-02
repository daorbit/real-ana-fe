import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge, Button, Card, Center, Group, Loader, Pagination, ScrollArea, SegmentedControl,
  Stack, Text, TextInput, Textarea, ThemeIcon, ActionIcon, Tooltip, Anchor,
  UnstyledButton, Divider,
} from "@mantine/core";
import {
  Inbox, Search, ShieldAlert, Trash2, ExternalLink, Send, CornerUpLeft,
  MailCheck, Ban, RefreshCw,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetContactMessagesQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
  useReplyToContactMessageMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useAuth } from "../auth";
import { dateTime, timeAgo } from "../utils";
import type { ContactMessage, ContactStatus } from "../types";

/**
 * Admin-only: the contact form inbox.
 *
 * Laid out as a list beside a reading pane, the way every mail client is —
 * because that is the shape of the task. One click selects, the message is
 * already open, and replying happens on the same screen. Rows that expand in
 * place were the wrong model: they made scanning impossible and hid every
 * action behind a second click.
 */

const STATUS_COLORS: Record<ContactStatus, string> = {
  new: "emerald",
  read: "gray",
  replied: "blue",
  spam: "red",
};

const SUBJECT_LABELS: Record<string, string> = {
  general: "General",
  sales: "Pricing",
  support: "Support",
  "platform-api": "Platform API",
  privacy: "Privacy",
  other: "Other",
  bug: "Bug report",
  feedback: "Feedback",
};

/** Shortest reply worth sending. Matches the server's own check. */
const MIN_REPLY = 10;

/** A bug report from a paying customer is not a cold sales enquiry — the two
 *  arrive in the same inbox and need telling apart at a glance. */
const SUBJECT_COLORS: Record<string, string> = {
  bug: "red",
  feedback: "violet",
  support: "orange",
};

export default function AdminContact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin =
    (user?.role === "admin" || user?.role === "super_admin") && !user?.impersonating;

  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetContactMessagesQuery(
    { status, source, q, page },
    { skip: !isAdmin }
  );
  const [update] = useUpdateContactMessageMutation();

  const messages = data?.messages ?? [];
  const selected = messages.find((m) => m._id === selectedId) ?? null;

  // Keep a selection alive across refetches, and fall back to the first row
  // when a filter change leaves the previous one off the page.
  useEffect(() => {
    if (!messages?.length) {
      setSelectedId(null);
      return;
    }
    if (!messages.some((m) => m._id === selectedId)) {
      setSelectedId(messages[0]._id);
    }
  }, [messages, selectedId]);

  // Reading a message is what marks it read. There is no separate control for
  // it because there is no case where an admin opens one and means "unread".
  useEffect(() => {
    if (selected?.status === "new") {
      update({ id: selected._id, status: "read" });
    }
  }, [selected?._id, selected?.status, update, selected]);

  if (!isAdmin) {
    return (
      <AppShell>
        <Center mih="60vh">
          <Stack align="center" gap="sm">
            <ThemeIcon variant="light" color="gray" size={56} radius="md">
              <ShieldAlert size={28} />
            </ThemeIcon>
            <Text fw={600}>Admins only</Text>
            <Text c="dimmed" size="sm">This page isn&apos;t available on your account.</Text>
            <Button variant="light" onClick={() => navigate("/app")}>Back to Home</Button>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Contact messages"
        description="Enquiries from the marketing site, plus support requests, bug reports and feedback raised inside the app. Senders get an automatic receipt; replies you send here go out from Quantalog."
        actions={
          <Group gap="sm">
            {data?.unread ? (
              <Badge color="emerald" variant="light" size="lg">
                {data.unread} unread
              </Badge>
            ) : null}
            {/* Messages arrive while the page is open and nothing polls for
                them, so there has to be a way to ask without a full reload. */}
            <Tooltip label="Check for new messages" withArrow>
              <ActionIcon
                variant="light"
                color="gray"
                size="lg"
                radius="md"
                loading={isFetching}
                onClick={() => refetch()}
                aria-label="Check for new messages"
              >
                <RefreshCw size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      <Group gap="sm" mb="md" wrap="wrap">
        <TextInput
          placeholder="Search name, email, company or message"
          leftSection={<Search size={15} />}
          value={q}
          onChange={(e) => {
            setQ(e.currentTarget.value);
            setPage(1);
          }}
          radius="md"
          style={{ flex: "1 1 260px" }}
        />
        <SegmentedControl
          size="sm"
          radius="md"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          data={[
            { value: "", label: "All" },
            { value: "new", label: "Unread" },
            { value: "replied", label: "Replied" },
            { value: "spam", label: "Spam" },
          ]}
        />
        <SegmentedControl
          size="sm"
          radius="md"
          value={source}
          onChange={(v) => {
            setSource(v);
            setPage(1);
          }}
          data={[
            { value: "", label: "Everywhere" },
            { value: "app", label: "In-app" },
            { value: "marketing", label: "Website" },
          ]}
        />
      </Group>

      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !messages.length ? (
        <Card withBorder radius="md" padding="xl">
          <Center>
            <Stack align="center" gap="sm" maw={420}>
              <ThemeIcon size={44} radius="xl" variant="light" color="emerald">
                <Inbox size={22} />
              </ThemeIcon>
              <Text fw={600}>{q || status ? "Nothing matches" : "No messages yet"}</Text>
              <Text size="sm" c="dimmed" ta="center">
                {q || status || source
                  ? "Try a different search or filter."
                  : "Contact enquiries from the marketing site, and support requests, bug reports and feedback raised inside the app, all arrive here."}
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "var(--mantine-spacing-md)",
            gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
            alignItems: "start",
          }}
          className="contact-layout"
        >
          <Card withBorder radius="md" padding={0} style={{ overflow: "hidden" }}>
            <ScrollArea.Autosize mah="calc(100vh - 300px)">
              <Stack gap={0} opacity={isFetching ? 0.65 : 1}>
                {messages.map((m, i) => (
                  <ListRow
                    key={m._id}
                    message={m}
                    selected={m._id === selectedId}
                    first={i === 0}
                    onSelect={() => setSelectedId(m._id)}
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>

            {(data?.pages ?? 1) > 1 && (
              <Group justify="center" p="sm" style={{ borderTop: "1px solid var(--border)" }}>
                <Pagination
                  size="sm"
                  value={page}
                  onChange={setPage}
                  total={data?.pages ?? 1}
                  radius="md"
                />
              </Group>
            )}
          </Card>

          {selected ? <Detail key={selected._id} message={selected} /> : <div />}
        </div>
      )}
    </AppShell>
  );
}

/* --------------------------------- list row -------------------------------- */

function ListRow({
  message,
  selected,
  first,
  onSelect,
}: {
  message: ContactMessage;
  selected: boolean;
  first: boolean;
  onSelect: () => void;
}) {
  const unread = message.status === "new";

  return (
    <UnstyledButton
      onClick={onSelect}
      style={{
        display: "block",
        width: "100%",
        padding: "12px 14px",
        borderTop: first ? undefined : "1px solid var(--border)",
        background: selected ? "var(--accent-soft)" : undefined,
        // A selected row needs an edge, not just a tint, or it disappears
        // against the card on light backgrounds.
        boxShadow: selected ? "inset 3px 0 0 var(--violet-2)" : undefined,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs" mb={3}>
        <Group gap={7} wrap="nowrap" style={{ minWidth: 0 }}>
          {unread && (
            <span
              aria-label="Unread"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--violet-2)",
                flexShrink: 0,
              }}
            />
          )}
          <Text size="sm" fw={unread ? 700 : 500} truncate>
            {message.name}
          </Text>
        </Group>
        <Text size="10px" c="dimmed" style={{ flexShrink: 0 }}>
          {timeAgo(message.createdAt)}
        </Text>
      </Group>

      <Text size="xs" c="dimmed" truncate mb={5}>
        {message.email}
      </Text>

      <Text size="xs" c="dimmed" lineClamp={2} style={{ lineHeight: 1.45 }}>
        {message.message}
      </Text>

      <Group gap={5} mt={7}>
        <Badge
          size="xs"
          variant="light"
          color={SUBJECT_COLORS[message.subject] ?? "gray"}
        >
          {SUBJECT_LABELS[message.subject] ?? message.subject}
        </Badge>
        {message.source === "app" && (
          <Badge size="xs" variant="outline" color="gray">
            in-app
          </Badge>
        )}
        {message.status !== "new" && message.status !== "read" && (
          <Badge size="xs" variant="light" color={STATUS_COLORS[message.status]}>
            {message.status}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}

/* -------------------------------- detail pane ------------------------------ */

function Detail({ message }: { message: ContactMessage }) {
  const [note, setNote] = useState(message.adminNote);
  const [replying, setReplying] = useState(false);
  const [subject, setSubject] = useState(`Re: ${SUBJECT_LABELS[message.subject] ?? "your message"}`);
  const [body, setBody] = useState("");
  const [touched, setTouched] = useState(false);

  const typed = body.trim().length;
  const tooShort = typed < MIN_REPLY;
  // Hold the error back until they have started or tried to send — flagging an
  // untouched empty box is scolding someone for nothing.
  const showError = typed > 0 || touched;

  const [update] = useUpdateContactMessageMutation();
  const [remove] = useDeleteContactMessageMutation();
  const [reply, { isLoading: sending }] = useReplyToContactMessageMutation();

  // Messages stored before replies existed have no array at all, and a schema
  // default only applies on write — so anything already in the database comes
  // back without the field.
  const replies = message.replies ?? [];

  async function setStatus(status: ContactStatus) {
    try {
      await update({ id: message._id, status }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not update the message"));
    }
  }

  async function saveNote() {
    if (note === message.adminNote) return;
    try {
      await update({ id: message._id, adminNote: note }).unwrap();
      notify.success("Note saved");
    } catch (e) {
      notify.error(errMessage(e, "Could not save the note"));
    }
  }

  async function send() {
    // A toast for a length problem points at the wrong place — the error
    // belongs on the field it is about, next to the counter.
    if (tooShort) {
      setTouched(true);
      return;
    }
    if (!subject.trim()) {
      setTouched(true);
      return;
    }
    try {
      await reply({ id: message._id, subject: subject.trim(), body: body.trim() }).unwrap();
      setBody("");
      setReplying(false);
      setTouched(false);
      notify.success(`Reply sent to ${message.email}`);
    } catch (e) {
      notify.error(errMessage(e, "The reply could not be sent"));
    }
  }

  function onDelete() {
    confirmDelete({
      title: "Delete this message?",
      body: "The message, any note on it and the record of your replies are removed. This cannot be undone.",
      confirmLabel: "Delete message",
      onConfirm: async () => {
        try {
          await remove(message._id).unwrap();
          notify.success("Message deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the message"));
        }
      },
    });
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={650} size="lg" truncate>{message.name}</Text>
            <Badge size="sm" variant="light" color={STATUS_COLORS[message.status]}>
              {message.status}
            </Badge>
            {/* Worth stating plainly: this address came from an authenticated
                session, so it is verified in a way a form field never is. */}
            {message.source === "app" && (
              <Badge size="sm" variant="outline" color="gray">
                Signed-in user
              </Badge>
            )}
          </Group>
          <Anchor href={`mailto:${message.email}`} size="sm" c="dimmed">
            {message.email}
          </Anchor>
        </Stack>

        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          {message.status !== "spam" && (
            <Tooltip label="Mark as spam" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={() => setStatus("spam")}>
                <Ban size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete message" withArrow>
            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
              <Trash2 size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Group gap="lg" mt="md" wrap="wrap">
        <Field label="Type" value={SUBJECT_LABELS[message.subject] ?? message.subject} />
        {message.company && <Field label="Company" value={message.company} />}
        <Field label="Received" value={dateTime(message.createdAt)} />
        {message.pageUrl && (
          <Stack gap={2}>
            <Label>Sent from</Label>
            <Anchor href={message.pageUrl} target="_blank" rel="noreferrer" size="xs">
              <Group gap={4} wrap="nowrap">
                <Text size="xs" truncate maw={260}>{message.pageUrl}</Text>
                <ExternalLink size={11} />
              </Group>
            </Anchor>
          </Stack>
        )}
      </Group>

      <Divider my="md" />

      <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
        {message.message}
      </Text>

      {replies.length > 0 && (
        <Stack gap="sm" mt="lg">
          <Label>Replies sent</Label>
          {replies.map((r, i) => (
            <Card key={i} withBorder radius="md" padding="sm" bg="var(--surface-2)">
              <Group gap={6} mb={6} wrap="nowrap">
                <MailCheck size={13} style={{ color: "var(--violet-2)", flexShrink: 0 }} />
                <Text size="xs" fw={600} truncate>{r.subject}</Text>
                <Text size="10px" c="dimmed" style={{ marginLeft: "auto", flexShrink: 0 }}>
                  {r.sentBy} · {dateTime(r.sentAt)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {r.body}
              </Text>
            </Card>
          ))}
        </Stack>
      )}

      <Divider my="md" />

      {replying ? (
        <Stack gap="sm">
          <TextInput
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            maxLength={200}
            radius="md"
            error={touched && !subject.trim() ? "A subject is required" : undefined}
          />
          <Textarea
            label="Your reply"
            description="Sent from Quantalog, with their original message quoted underneath. Plain text — no HTML."
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            autosize
            minRows={6}
            maxLength={10000}
            radius="md"
            placeholder={`Hi ${message.name.split(" ")[0]},\n\n`}
            // Fixed wording, and no running counter: an `x/10` that keeps
            // counting past 10 says nothing, and text that changes width on
            // every keystroke pulls the eye to the movement rather than the
            // meaning. This clears itself the moment the reply is long enough.
            error={showError && tooShort ? "Please write a little more" : undefined}
          />
          <Group gap="sm">
            <Button
              color="emerald"
              leftSection={<Send size={15} />}
              onClick={send}
              loading={sending}
            >
              Send reply
            </Button>
            <Button variant="subtle" color="gray" onClick={() => { setReplying(false); setTouched(false); }}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : (
        <Button
          variant="light"
          color="emerald"
          leftSection={<CornerUpLeft size={15} />}
          onClick={() => { setReplying(true); setTouched(false); }}
        >
          {replies.length ? "Reply again" : "Reply"}
        </Button>
      )}

      <Textarea
        mt="lg"
        label="Internal note"
        description="Only admins see this. It is never sent to the sender."
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        onBlur={saveNote}
        autosize
        minRows={2}
        maxLength={2000}
        radius="md"
      />
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text size="10px" tt="uppercase" c="dimmed" fw={700} lts={0.4}>
      {children}
    </Text>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Label>{label}</Label>
      <Text size="xs">{value}</Text>
    </Stack>
  );
}
