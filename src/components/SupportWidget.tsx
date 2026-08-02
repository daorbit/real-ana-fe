import { useState } from "react";
import {
  Menu, ActionIcon, Text, Modal, Stack, Textarea, Button, Group, ThemeIcon,
  Center, Alert,
} from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import {
  HelpCircle, BookOpen, Mail, Bug, MessageSquare, CheckCircle2, Info,
} from "lucide-react";
import { useSendSupportMessageMutation } from "../store";
import { notify, errMessage } from "../notify";
import { useAuth } from "../auth";

/**
 * Floating help button, docked bottom-right across the whole app. Pages add
 * bottom padding so their content never scrolls under it.
 *
 * Support, bug reports and feedback used to be `mailto:` links, which assumed a
 * configured mail client and dropped whoever did not have one. They now open a
 * dialog that posts to the same inbox the marketing site's contact form feeds —
 * one place to read, one place to reply from.
 *
 * Nothing asks for a name or an address: the sender is signed in, so the server
 * takes both from the account. A support form that makes a logged-in customer
 * retype their own email is asking them to prove something we already know.
 */

type Kind = "support" | "bug" | "feedback";

const KINDS: Record<
  Kind,
  { title: string; blurb: string; placeholder: string; icon: typeof Bug }
> = {
  support: {
    title: "Email support",
    blurb: "Tell us what you are stuck on and we will come back to you.",
    placeholder:
      "What are you trying to do, and what happened instead? Include the site or workspace if it is about one in particular.",
    icon: Mail,
  },
  bug: {
    title: "Report a bug",
    blurb: "Something behaving wrongly? The more specific, the faster we can fix it.",
    placeholder:
      "What did you do, what did you expect, and what happened instead? Steps to reproduce help enormously.",
    icon: Bug,
  },
  feedback: {
    title: "Send feedback",
    blurb: "Missing something, or found a rough edge? We read every one of these.",
    placeholder:
      "What would make Quantalog work better for you? Blunt is fine — it is more useful than polite.",
    icon: MessageSquare,
  },
};

export function SupportWidget() {
  const [kind, setKind] = useState<Kind | null>(null);

  return (
    <>
      <Menu shadow="lg" width={230} position="top-end" radius="md" withArrow>
        <Menu.Target>
          <ActionIcon
            size={48}
            radius="xl"
            variant="filled"
            color="emerald"
            title="Help & support"
            aria-label="Help and support"
            style={{
              position: "fixed",
              right: 24,
              bottom: 24,
              zIndex: 300,
              boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
            }}
          >
            <HelpCircle size={22} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Text size="xs" fw={600}>Need a hand?</Text>
          </Menu.Label>

          <Menu.Item
            component={Link}
            to="/app/developers"
            leftSection={<BookOpen size={15} />}
          >
            Documentation
          </Menu.Item>

          {(Object.keys(KINDS) as Kind[]).map((k) => {
            const Icon = KINDS[k].icon;
            return (
              <Menu.Item key={k} onClick={() => setKind(k)} leftSection={<Icon size={15} />}>
                {KINDS[k].title}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>

      <SupportDialog kind={kind} onClose={() => setKind(null)} />
    </>
  );
}

function SupportDialog({ kind, onClose }: { kind: Kind | null; onClose: () => void }) {
  const { user, isDemo } = useAuth();
  const loc = useLocation();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [send, { isLoading }] = useSendSupportMessageMutation();

  const config = kind ? KINDS[kind] : null;
  const tooShort = message.trim().length < 10;

  function close() {
    onClose();
    // Reset after the modal's exit transition, so the content does not visibly
    // change while it is still fading out.
    setTimeout(() => {
      setMessage("");
      setSent(false);
    }, 200);
  }

  async function submit() {
    if (!kind || tooShort) return;
    try {
      await send({
        kind,
        message: message.trim(),
        // The page they were on when they hit the problem is the single most
        // useful thing on a bug report, and the only one they should not have
        // to type.
        pageUrl: window.location.origin + loc.pathname,
      }).unwrap();
      setSent(true);
    } catch (e) {
      notify.error(errMessage(e, "Your message could not be sent"));
    }
  }

  return (
    <Modal
      opened={Boolean(kind)}
      onClose={close}
      title={config ? <Text fw={650}>{config.title}</Text> : undefined}
      centered
      radius="lg"
      size={480}
      overlayProps={{ blur: 3, backgroundOpacity: 0.5 }}
    >
      {sent ? (
        <Center py="lg">
          <Stack align="center" gap="sm" maw={340}>
            <ThemeIcon size={52} radius="xl" variant="light" color="emerald">
              <CheckCircle2 size={26} />
            </ThemeIcon>
            <Text fw={650}>Message sent</Text>
            <Text size="sm" c="dimmed" ta="center">
              A receipt is on its way to {user?.email}. A person reads every one of
              these — expect a reply within a working day.
            </Text>
            <Button variant="light" color="emerald" onClick={close} mt="xs">
              Done
            </Button>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {config?.blurb}
          </Text>

          {isDemo ? (
            <Alert color="gray" variant="light" radius="md" icon={<Info size={15} />}>
              <Text size="sm">
                You&apos;re in the read-only demo, so this form is switched off. Sign up
                for a free account and it will work from there.
              </Text>
            </Alert>
          ) : (
            <>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                placeholder={config?.placeholder}
                autosize
                minRows={5}
                maxLength={5000}
                radius="md"
                data-autofocus
              />

              <Text size="xs" c="dimmed">
                Sent from your account, so we will reply to {user?.email}. The page
                you&apos;re on is included automatically.
              </Text>

              <Group justify="flex-end" gap="sm">
                <Button variant="subtle" color="gray" onClick={close}>
                  Cancel
                </Button>
                <Button
                  color="emerald"
                  onClick={submit}
                  loading={isLoading}
                  disabled={tooShort}
                >
                  Send
                </Button>
              </Group>
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
}
