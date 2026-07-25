import { useEffect, useMemo, useState } from "react";
import {
  Modal, Stack, Group, Button, TextInput, Textarea, Text, Badge,
  Alert, Loader, ScrollArea, Code, Center, UnstyledButton, Collapse, Box,
} from "@mantine/core";
import {
  Send, AlertTriangle, FlaskConical, ArrowLeft, ChevronRight, ChevronDown, Check,
} from "lucide-react";
import {
  useGetEmailStatusQuery,
  useGetEmailSegmentsQuery,
  useGetEmailTemplatesQuery,
  useGetEmailRecipientsQuery,
  useSendAdminEmailMutation,
  useSendTestEmailMutation,
} from "../store";
import { notify, errMessage } from "../notify";
import type { AdminUser, EmailSegmentId } from "../types";

/**
 * Admin-only: compose and send a message, either to a segment or to one
 * account.
 *
 * Two steps rather than one long form. Choosing who to mail and writing what
 * they read are different decisions, and putting them on one screen meant the
 * audience — the part that is expensive to get wrong — competed for attention
 * with a textarea.
 *
 * When `user` is set the audience is already decided, so step one is skipped
 * entirely and the modal opens on the message.
 */
export function EmailComposer({
  opened,
  onClose,
  user,
}: {
  opened: boolean;
  onClose: () => void;
  /** Set to address exactly one account; omit for a segment broadcast. */
  user?: AdminUser | null;
}) {
  const single = Boolean(user);

  const { data: status, isLoading: statusLoading } = useGetEmailStatusQuery(undefined, {
    skip: !opened,
  });
  const { data: segmentData } = useGetEmailSegmentsQuery(undefined, {
    skip: !opened || single,
  });
  const { data: templateData } = useGetEmailTemplatesQuery(undefined, { skip: !opened });

  const [step, setStep] = useState<"audience" | "write">("audience");
  const [segment, setSegment] = useState<EmailSegmentId>("not-installed");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showList, setShowList] = useState(false);

  const [sendEmail, { isLoading: sending }] = useSendAdminEmailMutation();
  const [sendTest, { isLoading: testing }] = useSendTestEmailMutation();

  const { data: recipientData, isFetching: loadingRecipients } = useGetEmailRecipientsQuery(
    segment,
    { skip: !opened || single },
  );

  // A single-user send has no audience step to return to.
  useEffect(() => {
    if (opened) setStep(single ? "write" : "audience");
  }, [opened, single]);

  const recipients = useMemo(
    () => (single && user ? [{ id: user.id, email: user.email, name: user.name }] : recipientData?.recipients ?? []),
    [single, user, recipientData],
  );

  const templates = templateData?.templates ?? [];
  const busy = sending || testing;
  const canSend = Boolean(status?.configured && subject.trim() && body.trim() && recipients.length);

  const close = () => {
    if (busy) return;
    onClose();
  };

  const send = async () => {
    try {
      const result = await sendEmail({
        subject: subject.trim(),
        body: body.trim(),
        userIds: recipients.map((r) => r.id),
      }).unwrap();

      if (result.failed) {
        notify.error(
          `Sent to ${result.sent}, but ${result.failed} failed: ${result.failures
            .map((f) => f.email)
            .join(", ")}`,
          "Partly sent",
        );
      } else {
        notify.success(
          single
            ? `Message sent to ${recipients[0]?.email}.`
            : `Sent to ${result.sent} recipient${result.sent === 1 ? "" : "s"}.`,
          "Sent",
        );
        setSubject("");
        setBody("");
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

  const title = single ? `Message ${user?.name}` : step === "audience" ? "Who gets this?" : "Write your message";

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={title}
      centered
      radius="lg"
      size={single ? "lg" : "lg"}
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
            password.
          </Text>
        </Alert>
      ) : step === "audience" ? (
        /* ------------------------------ step 1 ------------------------------ */
        <Stack gap="xs">
          {(segmentData?.segments ?? []).map((s) => {
            const active = segment === s.id;
            return (
              <UnstyledButton
                key={s.id}
                onClick={() => setSegment(s.id)}
                style={{
                  border: `1px solid var(${active ? "--mantine-color-emerald-6" : "--mantine-color-default-border"})`,
                  background: active ? "var(--mantine-color-emerald-light)" : undefined,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <div style={{ minWidth: 0 }}>
                    <Group gap={7} wrap="nowrap">
                      {active && <Check size={14} />}
                      <Text size="sm" fw={600}>{s.label}</Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>{s.description}</Text>
                  </div>
                  <Badge variant="light" color={active ? "emerald" : "gray"} size="lg">
                    {s.count}
                  </Badge>
                </Group>
              </UnstyledButton>
            );
          })}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={close}>Cancel</Button>
            <Button
              color="emerald"
              radius="md"
              rightSection={<ChevronRight size={15} />}
              disabled={!recipients.length}
              onClick={() => setStep("write")}
            >
              Next
            </Button>
          </Group>
        </Stack>
      ) : (
        /* ------------------------------ step 2 ------------------------------ */
        <Stack gap="md">
          {/* Who this is going to, always visible while writing — the list
              itself is behind a toggle because it's reassurance, not something
              that needs to be read every time. */}
          <Box
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <Text size="sm" c="dimmed">To</Text>
                {single ? (
                  <Text size="sm" fw={600} truncate>
                    {user?.name}{" "}
                    <Text span c="dimmed" fw={400}>· {user?.email}</Text>
                  </Text>
                ) : (
                  <Text size="sm" fw={600}>
                    {loadingRecipients ? "…" : `${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`}
                  </Text>
                )}
              </Group>
              {!single && recipients.length > 0 && (
                <UnstyledButton onClick={() => setShowList((v) => !v)}>
                  <Group gap={3}>
                    <Text size="xs" c="emerald.6" fw={500}>
                      {showList ? "Hide" : "View"}
                    </Text>
                    {showList ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </Group>
                </UnstyledButton>
              )}
            </Group>

            <Collapse in={showList}>
              <ScrollArea.Autosize mah={140} mt="xs">
                <Stack gap={2}>
                  {recipients.map((r) => (
                    <Text key={r.id} size="xs" c="dimmed">
                      {r.name} · {r.email}
                    </Text>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            </Collapse>
          </Box>

          {templates.length > 0 && (
            <div>
              <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
                Start from
              </Text>
              <Group gap={6}>
                {templates.map((t) => (
                  <UnstyledButton
                    key={t.id}
                    disabled={busy}
                    onClick={() => {
                      setSubject(t.subject);
                      setBody(t.body);
                    }}
                    style={{
                      border: "1px solid var(--mantine-color-default-border)",
                      borderRadius: 8,
                      padding: "6px 11px",
                    }}
                  >
                    <Text size="xs" fw={500}>{t.label}</Text>
                  </UnstyledButton>
                ))}
              </Group>
            </div>
          )}

          <TextInput
            label="Subject"
            placeholder="Your Quantalog site isn't reporting yet"
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            disabled={busy}
          />

          <Textarea
            label="Message"
            description="Use {{name}} and {{email}} to personalise each message."
            placeholder="Hi {{name}}, …"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            minRows={8}
            autosize
            maxRows={14}
            disabled={busy}
          />

          {recipients.length > 20 && (
            <Text size="xs" c="dimmed">
              Sent one at a time — {recipients.length} messages take about{" "}
              {Math.ceil(recipients.length * 0.5)}s. Keep this window open.
            </Text>
          )}

          <Group justify="space-between" mt="xs">
            {single ? (
              <div />
            ) : (
              <Button
                variant="subtle"
                color="gray"
                leftSection={<ArrowLeft size={15} />}
                disabled={busy}
                onClick={() => setStep("audience")}
              >
                Back
              </Button>
            )}
            <Group gap="xs">
              <Button
                variant="default"
                radius="md"
                leftSection={testing ? <Loader size={13} /> : <FlaskConical size={15} />}
                disabled={!subject.trim() || !body.trim() || busy}
                onClick={test}
              >
                Test to me
              </Button>
              <Button
                color="emerald"
                radius="md"
                leftSection={sending ? <Loader size={13} color="white" /> : <Send size={15} />}
                disabled={!canSend || busy}
                onClick={send}
              >
                {sending
                  ? "Sending…"
                  : single
                  ? "Send"
                  : `Send to ${recipients.length}`}
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
