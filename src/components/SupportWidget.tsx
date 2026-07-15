import { Menu, ActionIcon, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { HelpCircle, BookOpen, Mail, Bug, MessageSquare } from "lucide-react";

const SUPPORT_EMAIL = "daorbit2k25@gmail.com";

/**
 * Floating help button, docked bottom-right across the whole app. Pages add
 * bottom padding so their content never scrolls under it. Opens self-serve and
 * human-support routes; dependency-free, so it works with no third-party chat
 * service.
 */
export function SupportWidget() {
  const mailto = (subject: string) =>
    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
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

        <Menu.Item
          component="a"
          href={mailto("Quantalog support")}
          leftSection={<Mail size={15} />}
        >
          Email support
        </Menu.Item>

        <Menu.Item
          component="a"
          href={mailto("Bug report — Quantalog")}
          leftSection={<Bug size={15} />}
        >
          Report a bug
        </Menu.Item>

        <Menu.Item
          component="a"
          href={mailto("Feedback — Quantalog")}
          leftSection={<MessageSquare size={15} />}
        >
          Send feedback
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
