import { useEffect, useRef } from "react";
import {
  Stack, Group, Text, Textarea, ActionIcon, ScrollArea, ThemeIcon, Center,
  UnstyledButton, Loader, Alert,
} from "@mantine/core";
import { Sparkles, ArrowUp, AlertTriangle } from "lucide-react";
import { ORBIT_SUGGESTIONS, type OrbitMessage } from "../../hooks/useOrbitChat";
import type { useOrbitChat } from "../../hooks/useOrbitChat";

/**
 * The conversation itself — thread, composer, and the empty state.
 *
 * Rendered by both the floating bubble and the Help & support page, which is
 * why it takes its state as a prop rather than calling the hook: the two
 * surfaces share one conversation while the tab is open, and a hook call in
 * here would give each of them their own.
 */

function Bubble({ message }: { message: OrbitMessage }) {
  const isUser = message.role === "user";

  return (
    <Group
      justify={isUser ? "flex-end" : "flex-start"}
      wrap="nowrap"
      gap={8}
      align="flex-start"
    >
      {!isUser && (
        <ThemeIcon
          size={26}
          radius="xl"
          variant="light"
          color={message.failed ? "orange" : "emerald"}
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          {message.failed ? <AlertTriangle size={13} /> : <Sparkles size={13} />}
        </ThemeIcon>
      )}
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: 12,
          // The user's turn is filled, Orbit's is outlined. Two filled colours
          // would make the thread read as two brands talking.
          background: isUser ? "var(--mantine-color-emerald-light)" : "var(--mantine-color-default)",
          border: `1px solid var(${
            message.failed
              ? "--mantine-color-orange-6"
              : isUser
                ? "--mantine-color-emerald-6"
                : "--mantine-color-default-border"
          })`,
        }}
      >
        {/* `pre-wrap` so the model's own paragraph breaks survive without
            running its output through a markdown renderer — the prompt asks for
            plain sentences, and rendering markdown would reward ignoring that. */}
        <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
          {message.content}
        </Text>
      </div>
    </Group>
  );
}

/** The opening screen: what Orbit is for, and four questions it can answer. */
function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <Center h="100%" px="md">
      <Stack align="center" gap="xs" maw={380}>
        <ThemeIcon size={44} radius="xl" variant="light" color="emerald">
          <Sparkles size={21} />
        </ThemeIcon>
        <Text fw={650} mt={4}>Ask Orbit</Text>
        <Text size="sm" c="dimmed" ta="center" lh={1.6}>
          Questions about installing the tracker, what a number means, or how a
          feature works. Orbit knows the product — it can't see your analytics.
        </Text>

        <Stack gap={6} mt="md" w="100%">
          {ORBIT_SUGGESTIONS.map((q) => (
            <UnstyledButton
              key={q}
              onClick={() => onPick(q)}
              style={{
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: 8,
                padding: "8px 11px",
              }}
            >
              <Text size="xs">{q}</Text>
            </UnstyledButton>
          ))}
        </Stack>
      </Stack>
    </Center>
  );
}

export function OrbitChat({
  chat,
  height,
}: {
  chat: ReturnType<typeof useOrbitChat>;
  /** The thread's scroll height. The bubble is fixed; the page gives it more room. */
  height: number | string;
}) {
  const { messages, input, setInput, send, thinking, available, started } = chat;
  const bottom = useRef<HTMLDivElement>(null);

  // Follow the conversation as it grows, including while Orbit is thinking —
  // the indicator is the thing worth keeping in view at that moment.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  if (!available) {
    return (
      <Alert color="orange" icon={<AlertTriangle size={16} />} title="Orbit isn't available">
        <Text size="sm">
          This server has no model configured, so Orbit can't answer anything yet.
          Email support can still reach us.
        </Text>
      </Alert>
    );
  }

  return (
    <Stack gap="sm" h="100%">
      <ScrollArea h={height} type="hover" offsetScrollbars>
        {!started ? (
          <EmptyState onPick={(q) => send(q)} />
        ) : (
          <Stack gap="md" p={2}>
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}

            {thinking && (
              <Group gap={8} wrap="nowrap" align="center">
                <ThemeIcon size={26} radius="xl" variant="light" color="emerald">
                  <Sparkles size={13} />
                </ThemeIcon>
                <Group gap={6}>
                  <Loader size={13} type="dots" color="gray" />
                  <Text size="xs" c="dimmed">Thinking…</Text>
                </Group>
              </Group>
            )}
            <div ref={bottom} />
          </Stack>
        )}
      </ScrollArea>

      <Textarea
        placeholder="Ask about Quantalog…"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        // Enter sends, shift+Enter breaks a line. The opposite trips everyone
        // who has ever used a chat, and support questions are short enough that
        // the line break is the rarer of the two.
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        autosize
        minRows={1}
        maxRows={5}
        radius="md"
        disabled={thinking}
        rightSection={
          <ActionIcon
            variant="filled"
            color="emerald"
            radius="xl"
            size="sm"
            disabled={!input.trim() || thinking}
            onClick={() => send()}
            aria-label="Send"
          >
            <ArrowUp size={14} />
          </ActionIcon>
        }
      />

      <Text size="xs" c="dimmed" ta="center">
        Orbit can be wrong. Check anything important, or use Email support.
      </Text>
    </Stack>
  );
}
