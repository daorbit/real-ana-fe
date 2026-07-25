import { useEffect, useMemo, useState } from "react";
import {
  Modal, Stack, Group, Button, TextInput, Textarea, Text, Card, Badge,
  Radio, Alert, Loader, Checkbox, ScrollArea, Divider, Code, ThemeIcon, Center,
} from "@mantine/core";
import { Mail, Send, AlertTriangle, Users, FlaskConical, Info } from "lucide-react";
import {
  useGetEmailStatusQuery,
  useGetEmailSegmentsQuery,
  useGetEmailRecipientsQuery,
  useSendAdminEmailMutation,
  useSendTestEmailMutation,
} from "../store";
import { notify, errMessage } from "../notify";
import type { EmailSegmentId } from "../types";

/** Starting points, so a routine nudge doesn't have to be written from scratch. */
const TEMPLATES: { label: string; segment: EmailSegmentId; subject: string; body: string }[] = [
  {
    label: "Install reminder",
    segment: "not-installed",
    subject: "One step left to start seeing your traffic",
    body: `Hi {{name}},

Thanks for signing up to Quantalog. Your site is set up, but we haven't seen any traffic from it yet — which usually means the tracking snippet hasn't been added to the site.

It's one line in your page's <head>, and you'll find it under Settings in your dashboard. Once it's live, your analytics start filling in within a minute or two.

If you hit a snag, reply to this email and I'll help you get it working.`,
  },
  {
    label: "Welcome",
    segment: "no-sites",
    subject: "Welcome to Quantalog",
    body: `Hi {{name}},

Welcome aboard, and thanks for signing up.

To get started, add your first site from the dashboard — you'll get a tracking snippet to drop into your pages, and your traffic starts showing up right away.

If anything is unclear, just reply to this email.`,
  },
];

/**
 * Admin-only: compose and send a message to a group of accounts.
 *
 * Sending mail to real people is not undoable, so the flow is deliberately
 * slow at the point that matters: the recipient list is resolved and shown in
 * full before anything sends, individuals can be unticked, and the send button
 * names the exact count it is about to mail.
 *
 * Delivery goes through Gmail SMTP, which sends sequentially — a list of a
 * hundred takes the better part of a minute, so the modal stays open and
 * blocked while it runs rather than pretending it finished.
 */
export function EmailComposer({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { data: status, isLoading: statusLoading } = useGetEmailStatusQuery(undefined, {
    skip: !opened,
  });
  const { data: segmentData } = useGetEmailSegmentsQuery(undefined, { skip: !opened });

  const [segment, setSegment] = useState<EmailSegmentId>("not-installed");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  // Which recipients are unticked. Tracking exclusions rather than inclusions
  // means a segment that grows between preview and send still mails the new
  // people, which is what "everyone who hasn't installed" should mean.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const [sendEmail, { isLoading: sending }] = useSendAdminEmailMutation();
  const [sendTest, { isLoading: testing }] = useSendTestEmailMutation();

  const { data: recipientData, isFetching: loadingRecipients } = useGetEmailRecipientsQuery(
    segment,
    { skip: !opened },
  );

  // A different audience makes the previous exclusions meaningless.
  useEffect(() => setExcluded(new Set()), [segment]);

  const recipients = recipientData?.recipients ?? [];
  const selected = useMemo(
    () => recipients.filter((r) => !excluded.has(r.id)),
    [recipients, excluded],
  );

  const canSend = Boolean(status?.configured && subject.trim() && body.trim() && selected.length);

  const reset = () => {
    setSubject("");
    setBody("");
    setExcluded(new Set());
  };

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setSegment(t.segment);
    setSubject(t.subject);
    setBody(t.body);
  };

  const toggle = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const send = async () => {
    try {
      const result = await sendEmail({
        subject: subject.trim(),
        body: body.trim(),
        // Send the resolved ids, not the segment — the admin approved this
        // exact list, and re-resolving server-side could mail someone they
        // just unticked.
        userIds: selected.map((r) => r.id),
      }).unwrap();

      if (result.failed) {
        notify.error(
          `Sent to ${result.sent}, but ${result.failed} failed: ${result.failures
            .map((f) => f.email)
            .join(", ")}`,
          "Partly sent",
        );
      } else {
        notify.success(`Sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}.`, "Sent");
        reset();
        onClose();
      }
    } catch (e) {
      notify.error(errMessage(e, "Could not send the message."));
    }
  };

  const test = async () => {
    try {
      const r = await sendTest({ subject: subject.trim(), body: body.trim() }).unwrap();
      notify.success(`Test message sent to ${r.email}.`, "Test sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test."));
    }
  };

  const busy = sending || testing;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Send a message"
      centered
      radius="lg"
      size="xl"
      // A half-finished draft shouldn't vanish on a stray click, and a send in
      // progress must not be interrupted.
      closeOnClickOutside={false}
      closeOnEscape={!busy}
      withCloseButton={!busy}
    >
      {statusLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !status?.configured ? (
        <Alert color="orange" icon={<AlertTriangle size={16} />} title="Email isn't configured">
          <Text size="sm">
            The server has no Gmail credentials, so nothing can be sent yet. Set{" "}
            <Code>SMTP_USER</Code> and <Code>SMTP_PASS</Code> in the backend environment
            — <Code>SMTP_PASS</Code> must be a Google App Password, not the account
            password, and it's generated under Security in the Google account settings.
          </Text>
        </Alert>
      ) : (
        <Stack gap="lg">
          <Group gap="xs">
            <ThemeIcon variant="light" color="emerald" size="sm" radius="sm">
              <Mail size={13} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              Sending as <b>{status.from}</b>
            </Text>
          </Group>

          <div>
            <Text size="sm" fw={600} mb={6}>Start from a template</Text>
            <Group gap="xs">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.label}
                  size="xs"
                  variant="default"
                  radius="md"
                  disabled={busy}
                  onClick={() => applyTemplate(t)}
                >
                  {t.label}
                </Button>
              ))}
            </Group>
          </div>

          <Divider />

          <div>
            <Text size="sm" fw={600} mb={8}>Who gets this</Text>
            <Radio.Group value={segment} onChange={(v) => setSegment(v as EmailSegmentId)}>
              <Stack gap={8}>
                {(segmentData?.segments ?? []).map((s) => (
                  <Radio
                    key={s.id}
                    value={s.id}
                    color="emerald"
                    disabled={busy}
                    label={
                      <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw={500}>{s.label}</Text>
                        <Badge size="xs" variant="light" color="gray">{s.count}</Badge>
                      </Group>
                    }
                    description={s.description}
                  />
                ))}
              </Stack>
            </Radio.Group>
          </div>

          <TextInput
            label="Subject"
            placeholder="One step left to start seeing your traffic"
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            disabled={busy}
          />

          <Textarea
            label="Message"
            description="Plain text. Use {{name}} and {{email}} to personalise each message."
            placeholder="Hi {{name}}, …"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            minRows={9}
            autosize
            maxRows={16}
            disabled={busy}
          />

          <Card withBorder radius="md" p="sm">
            <Group justify="space-between" mb={selected.length ? "xs" : 0}>
              <Group gap="xs">
                <Users size={15} />
                <Text size="sm" fw={600}>
                  Recipients{" "}
                  <Text span c="dimmed" fw={400}>
                    ({selected.length} of {recipients.length})
                  </Text>
                </Text>
              </Group>
              {loadingRecipients && <Loader size="xs" />}
            </Group>

            {!loadingRecipients && !recipients.length ? (
              <Text size="sm" c="dimmed">No accounts match this group.</Text>
            ) : (
              <ScrollArea.Autosize mah={200}>
                <Stack gap={6}>
                  {recipients.map((r) => (
                    <Checkbox
                      key={r.id}
                      size="xs"
                      color="emerald"
                      disabled={busy}
                      checked={!excluded.has(r.id)}
                      onChange={() => toggle(r.id)}
                      label={
                        <Text size="xs">
                          {r.name} <Text span c="dimmed">· {r.email}</Text>
                        </Text>
                      }
                    />
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            )}
          </Card>

          {selected.length > 20 && (
            <Alert color="blue" icon={<Info size={15} />} p="xs">
              <Text size="xs">
                Gmail sends these one at a time, so {selected.length} messages will take
                roughly {Math.ceil(selected.length * 0.5)} seconds. Keep this window open.
              </Text>
            </Alert>
          )}

          <Group justify="space-between">
            <Button
              variant="default"
              radius="md"
              leftSection={testing ? <Loader size={13} /> : <FlaskConical size={15} />}
              disabled={!subject.trim() || !body.trim() || busy}
              onClick={test}
            >
              Send test to myself
            </Button>
            <Group gap="xs">
              <Button variant="subtle" color="gray" disabled={busy} onClick={onClose}>
                Cancel
              </Button>
              <Button
                color="emerald"
                radius="md"
                leftSection={sending ? <Loader size={13} color="white" /> : <Send size={15} />}
                disabled={!canSend || busy}
                onClick={send}
              >
                {sending
                  ? `Sending ${selected.length}…`
                  : `Send to ${selected.length}`}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
