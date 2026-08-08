import { Paper, Group, Text, ActionIcon, ThemeIcon, Tooltip, Box } from "@mantine/core";
import { Sparkles, X, RotateCcw } from "lucide-react";
import { OrbitChat } from "./OrbitChat";
import { useOrbit } from "./OrbitProvider";

/**
 * Orbit, floating over whatever the user is stuck on.
 *
 * A panel rather than a route, because the question is almost always about the
 * screen behind it — navigating away to ask "what does this number mean" loses
 * the number. This is Orbit's only home; the Help & support page is for
 * reaching a person, which is a different thing entirely.
 *
 * Rendered by the app shell, so it is available on every signed-in page and
 * keeps its conversation across navigation.
 */
export function OrbitBubble() {
  const { chat, opened, close, toggle } = useOrbit();

  return (
    <>
      {opened && (
        <Paper
          withBorder
          radius="lg"
          shadow="lg"
          p="md"
          className="orbit-panel"
        >
          <Group justify="space-between" mb="sm" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <ThemeIcon size={26} radius="xl" variant="light" color="emerald">
                <Sparkles size={13} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={650} lh={1.2}>Orbit AI</Text>
                <Text size="xs" c="dimmed" lh={1.2}>Product help</Text>
              </div>
            </Group>
            <Group gap={2} wrap="nowrap">
              {chat.started && (
                <Tooltip label="Start over" withArrow>
                  <ActionIcon variant="subtle" color="gray" onClick={chat.reset}>
                    <RotateCcw size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
              <ActionIcon variant="subtle" color="gray" onClick={close} aria-label="Close Orbit">
                <X size={16} />
              </ActionIcon>
            </Group>
          </Group>

          <Box style={{ height: 420 }}>
            <OrbitChat chat={chat} height={340} />
          </Box>
        </Paper>
      )}

      {/* Hidden while the panel is open — the panel has its own close button in
          the corner it would otherwise sit behind. Reaching a person is on the
          Help & support page, and Orbit points there when it cannot help. */}
      {!opened && (
        <Tooltip label="Ask Orbit AI" position="left" withArrow>
          <ActionIcon
            className="orbit-fab"
            radius="xl"
            color="emerald"
            variant="filled"
            onClick={toggle}
            aria-label="Ask Orbit AI"
          >
            <Sparkles size={20} />
          </ActionIcon>
        </Tooltip>
      )}
    </>
  );
}
