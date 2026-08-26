import { useState } from "react";
import {
  Box, Card, Stack, Group, Text, ThemeIcon, SegmentedControl, Textarea,
  Button, Center, Alert, Anchor, TextInput,
} from "@mantine/core";
import { useLocation } from "react-router-dom";
import {
  BookOpen, ArrowUpRight, CheckCircle2, Info, Send, Mail,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { SUPPORT_KINDS, type Kind } from "@/features/support/supportKinds";
import { useSendSupportMessageMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";

const DOCS_URL = "https://quantalog.daorbit.in/docs";
const MIN_MESSAGE = 10;

/**
 * Help & support.
 *
 * The contact form itself, on the page. This replaced a floating "?" button
 * whose only job was opening a modal around the same three options — someone
 * who navigated here has already decided to write to a person, and a card that
 * opens a dialog to reach a textarea is a step that existed only because the
 * widget had nowhere else to put it.
 *
 * Orbit is deliberately not here. It lives in the floating window, where the
 * question is usually about the screen behind it; duplicating it on a page you
 * have to navigate to would be a second entry point to the same conversation
 * and a second thing to keep in step.
 *
 * What differs from the marketing site's version of this form: the sender is
 * signed in, so their name and address come from the account rather than from
 * fields they retype — and the server takes them from the session regardless.
 */
export default function Help() {
  const { user, isDemo } = useAuth();
  const loc = useLocation();

  const [kind, setKind] = useState<Kind>("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [send, { isLoading }] = useSendSupportMessageMutation();

  const config = SUPPORT_KINDS[kind];
  const typed = message.trim().length;
  const tooShort = typed < MIN_MESSAGE;
  const showError = touched && tooShort;

  async function submit() {
    if (tooShort) {
      setTouched(true);
      return;
    }
    trace(user?.id, "support_message_sent", "help", kind);
    try {
      await send({
        kind,
        // The subject line is optional, so it is folded into the message rather
        // than sent as its own field — the inbox already titles a message by
        // its kind, and an empty subject would just be a blank heading.
        message: subject.trim()
          ? `${subject.trim()}\n\n${message.trim()}`
          : message.trim(),
        pageUrl: window.location.origin + loc.pathname,
      }).unwrap();
      setSent(true);
    } catch (e) {
      notify.error(errMessage(e, "Your message could not be sent"));
    }
  }

  function writeAnother() {
    setSent(false);
    setSubject("");
    setMessage("");
    setTouched(false);
  }

  return (
    <AppShell>
      <PageHeader
        title="Help & support"
        description="Tell us what you need. A person reads every message and replies within a working day."
        actions={
          <Anchor href={DOCS_URL} target="_blank" rel="noopener noreferrer" size="sm" fw={600}>
            <Group gap={4} wrap="nowrap">
              <BookOpen size={14} />
              Read the docs
              <ArrowUpRight size={14} />
            </Group>
          </Anchor>
        }
      />

      {/* One column, capped and centred, rather than a form beside a column of
          static prose. The three cards that used to sit on the right said
          things that did not change and were never read twice — the docs are
          now one link in the header, and what to expect is said where it
          matters: under the field it is about. */}
      <Box className="support-page">
        <Card withBorder radius="lg" padding="lg">
          {sent ? (
            <Center py={48}>
              <Stack align="center" gap="sm" maw={360}>
                <ThemeIcon size={52} radius="xl" variant="light" color="emerald">
                  <CheckCircle2 size={26} />
                </ThemeIcon>
                <Text fw={650}>Message sent</Text>
                <Text size="sm" c="dimmed" ta="center" lh={1.6}>
                  A receipt is on its way to {user?.email}. A person reads every one
                  of these — expect a reply within a working day.
                </Text>
                <Button variant="light" color="emerald" onClick={writeAnother} mt="xs">
                  Write another
                </Button>
              </Stack>
            </Center>
          ) : (
            <Stack gap="md">
              {/* A segmented control rather than a row of cards. This picks a
                  label for the message — it is not the task, and given tiles
                  with icons and borders it was the loudest thing on a page
                  whose actual job is the box underneath. */}
              <SegmentedControl
                fullWidth
                radius="md"
                value={kind}
                onChange={(v) => setKind(v as Kind)}
                disabled={isDemo}
                data={(Object.keys(SUPPORT_KINDS) as Kind[]).map((k) => {
                  const { title, icon: Icon } = SUPPORT_KINDS[k];
                  return {
                    value: k,
                    label: (
                      <Group gap={7} wrap="nowrap" justify="center">
                        <Icon size={14} />
                        <span>{title}</span>
                      </Group>
                    ),
                  };
                })}
              />

              {isDemo ? (
                <Alert color="gray" variant="light" radius="md" icon={<Info size={15} />}>
                  <Text size="sm">
                    You&apos;re in the read-only demo, so this form is switched off. Sign
                    up for a free account and it will work from there.
                  </Text>
                </Alert>
              ) : (
                <>
                  <TextInput
                    label="Subject"
                    description="Optional — a one-line summary helps us route it."
                    placeholder="Events stopped arriving on Tuesday"
                    value={subject}
                    onChange={(e) => setSubject(e.currentTarget.value)}
                    maxLength={160}
                    radius="md"
                  />

                  <Textarea
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.currentTarget.value)}
                    onBlur={() => setTouched(true)}
                    placeholder={config.placeholder}
                    autosize
                    minRows={8}
                    maxRows={18}
                    maxLength={5000}
                    radius="md"
                    error={showError ? "Please write a little more" : undefined}
                  />

                  <Group justify="space-between" wrap="nowrap" gap="md" align="center">
                    {/* Where the reply will land, said once, next to the button
                        that sends it — the one fact about what happens next
                        that someone might actually need, at the moment it is
                        relevant. */}
                    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                      <Mail size={13} style={{ flexShrink: 0, color: "var(--muted)" }} />
                      <Text size="xs" c="dimmed" lh={1.5} truncate>
                        We&apos;ll reply to {user?.email}
                      </Text>
                    </Group>
                    <Button
                      color="emerald"
                      radius="md"
                      leftSection={<Send size={15} />}
                      onClick={submit}
                      loading={isLoading}
                      style={{ flexShrink: 0 }}
                    >
                      Send
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          )}
        </Card>

        {/* Orbit gets one line rather than a card. It is already on screen —
            the floating button in the corner — so this only has to point at
            it, and a card to say "there is a button over there" was the least
            earned of the three that used to sit here. */}
        {!isDemo && !sent && (
          <Text size="xs" c="dimmed" ta="center" mt="md" lh={1.6}>
            In a hurry? Orbit AI, in the bottom corner, answers product questions
            instantly — though it can&apos;t see your account.
          </Text>
        )}
      </Box>
    </AppShell>
  );
}
