import { useState } from "react";
import {
  Card, Stack, Group, Text, ThemeIcon, SimpleGrid, UnstyledButton, Textarea,
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
        description="Write to us, or read the docs. A person replies within a working day."
      />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
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
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8} style={{ letterSpacing: "0.5px" }}>
                  What is this about?
                </Text>
                <Stack gap={6}>
                  {(Object.keys(SUPPORT_KINDS) as Kind[]).map((k) => {
                    const { title, blurb, icon: Icon } = SUPPORT_KINDS[k];
                    const active = kind === k;
                    return (
                      <UnstyledButton
                        key={k}
                        onClick={() => setKind(k)}
                        disabled={isDemo}
                        style={{
                          border: `1px solid var(${active ? "--mantine-color-emerald-6" : "--mantine-color-default-border"})`,
                          background: active ? "var(--mantine-color-emerald-light)" : undefined,
                          borderRadius: 10,
                          padding: "10px 12px",
                          opacity: isDemo ? 0.55 : 1,
                        }}
                      >
                        <Group gap={10} wrap="nowrap" align="flex-start">
                          <ThemeIcon
                            size={26}
                            radius="md"
                            variant="light"
                            color={active ? "emerald" : "gray"}
                            mt={1}
                          >
                            <Icon size={13} />
                          </ThemeIcon>
                          <div style={{ minWidth: 0 }}>
                            <Text size="sm" fw={600} lh={1.3}>{title}</Text>
                            <Text size="xs" c="dimmed" lh={1.45} mt={2}>{blurb}</Text>
                          </div>
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </div>

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
                    minRows={7}
                    maxRows={16}
                    maxLength={5000}
                    radius="md"
                    error={showError ? "Please write a little more" : undefined}
                  />

                  <Group justify="space-between" wrap="nowrap" gap="md">
                    <Text size="xs" c="dimmed" lh={1.5}>
                      Sent from your account, so we reply to {user?.email}. The page
                      you came from is included automatically.
                    </Text>
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

        <Stack gap="lg">
          <Card withBorder radius="lg" padding="lg">
            <Group gap={10} wrap="nowrap" mb="xs">
              <ThemeIcon size={32} radius="xl" variant="light" color="gray">
                <BookOpen size={16} />
              </ThemeIcon>
              <div>
                <Text fw={650} lh={1.25}>Documentation</Text>
                <Text size="xs" c="dimmed" lh={1.4} mt={2}>
                  Install guides, the API reference, and every setting explained
                </Text>
              </div>
            </Group>
            <Anchor href={DOCS_URL} target="_blank" rel="noopener noreferrer" size="sm" fw={600}>
              <Group gap={4} wrap="nowrap">
                Open the docs
                <ArrowUpRight size={14} />
              </Group>
            </Anchor>
          </Card>

          <Card withBorder radius="lg" padding="lg">
            <Group gap={10} wrap="nowrap" mb="xs">
              <ThemeIcon size={32} radius="xl" variant="light" color="gray">
                <Mail size={16} />
              </ThemeIcon>
              <div>
                <Text fw={650} lh={1.25}>What to expect</Text>
              </div>
            </Group>
            <Stack gap={10} mt="xs">
              <Text size="sm" c="dimmed" lh={1.6}>
                Every message reaches a person, not a queue. Replies go to{" "}
                <Text span fw={600} c="var(--mantine-color-text)">{user?.email}</Text> —
                the address on your account — usually within one working day.
              </Text>
              <Text size="sm" c="dimmed" lh={1.6}>
                For a bug, the fastest thing you can include is what you did, what you
                expected, and what happened instead. For anything about a specific
                site, its domain.
              </Text>
              <Text size="sm" c="dimmed" lh={1.6}>
                In a hurry? Orbit AI — the button in the bottom corner — answers
                product questions instantly, though it can&apos;t see your account.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>
    </AppShell>
  );
}
