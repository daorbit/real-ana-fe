import { Paper, Group, Text, ActionIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { X, RotateCcw } from "lucide-react";
import { OrbitChat } from "./OrbitChat";
import { OrbitMark } from "./OrbitMark";
import { useOrbit } from "./OrbitProvider";

/**
 * Orbit, floating over whatever the user is stuck on.
 *
 * A panel rather than a route, because the question is almost always about the
 * screen behind it — navigating away to ask "what does this number mean" loses
 * the number. This is Orbit's only home; the Help & support page is for
 * reaching a person, which is a different thing entirely.
 *
 * The chrome is deliberately thin. At 400px wide, every element in the header
 * is competing with the conversation for the same few hundred pixels, so the
 * header is one line: a mark, a name, and the two controls that matter. "Start
 * over" moved into an overflow menu — it is used once a session at most, and it
 * was costing a permanent slot beside the close button.
 *
 * Rendered by the app shell, so it is available on every signed-in page and
 * keeps its conversation across navigation.
 */
export function OrbitBubble() {
  const { chat, opened, close, toggle } = useOrbit();

  return (
    <>
      {opened && (
        // No padding on the Paper itself: the header, thread and composer each
        // own their insets, which is what lets the header rule run the full
        // width instead of floating inside a margin.
        <Paper withBorder radius="lg" shadow="xl" p={0} className="orbit-panel">
          <Group
            justify="space-between"
            wrap="nowrap"
            px="md"
            py={10}
            style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
          >
            <Group gap={8} wrap="nowrap">
              <OrbitMark size={22} />
              <Text size="sm" fw={600}>Orbit AI</Text>
            </Group>

            <Group gap={0} wrap="nowrap">
              {/* Only "start over" here. The model picker moved down beside
                  the input, where it sits next to the thing it affects — in the
                  header it was a setting nobody would think to look for. */}
              {chat.started && (
                <Tooltip label="Start over" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={chat.reset}
                    aria-label="Start over"
                  >
                    <RotateCcw size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={close}
                aria-label="Close Orbit"
              >
                <X size={15} />
              </ActionIcon>
            </Group>
          </Group>

          <OrbitChat chat={chat} height={400} />
        </Paper>
      )}

      {/* Always on screen, open or closed. Hiding it while the panel was up
          left the corner empty and made the panel look detached from the thing
          that spawned it — and it is the control people reach for to dismiss a
          floating window, whether or not there is also an X.

          An unstyled button, not an ActionIcon: the mark is the whole surface,
          so a filled emerald circle behind it would be a second green disc
          around a green disc. */}
      <Tooltip label={opened ? "Hide Orbit" : "Ask Orbit AI"} position="left" withArrow>
        <UnstyledButton
          className="orbit-fab"
          data-open={opened || undefined}
          onClick={toggle}
          aria-label={opened ? "Hide Orbit" : "Ask Orbit AI"}
          aria-expanded={opened}
        >
          <OrbitMark size={52} />
        </UnstyledButton>
      </Tooltip>
    </>
  );
}
