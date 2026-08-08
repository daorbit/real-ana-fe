import { useEffect, useRef } from "react";
import {
  Stack, Group, Text, Textarea, ActionIcon, ScrollArea, Center,
  UnstyledButton, Loader, Box,
} from "@mantine/core";
import { ArrowUp, AlertTriangle } from "lucide-react";
import { ORBIT_SUGGESTIONS, type OrbitMessage } from "../../hooks/useOrbitChat";
import type { useOrbitChat } from "../../hooks/useOrbitChat";

/**
 * The conversation itself — thread, composer, and the empty state.
 *
 * Rendered by the floating panel, and takes its state as a prop rather than
 * calling the hook so the conversation can be owned above it and survive the
 * panel being closed.
 *
 * The layout is built around one constraint: at 400px wide there is room for
 * the conversation and almost nothing else. Every element that is not a message
 * has been either removed or folded into one that stays.
 */

function Bubble({ message }: { message: OrbitMessage }) {
  const isUser = message.role === "user";

  // The user's turn is a filled bubble; Orbit's is plain text on the panel.
  // Giving both a bubble made the thread read as two systems talking past each
  // other, and at this width the borders ate the line length that makes an
  // answer readable.
  if (isUser) {
    return (
      <Group justify="flex-end" wrap="nowrap">
        <Box
          style={{
            maxWidth: "85%",
            padding: "7px 12px",
            borderRadius: 14,
            borderBottomRightRadius: 4,
            background: "var(--mantine-color-emerald-light)",
          }}
        >
          <Text size="sm" lh={1.55} style={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
        </Box>
      </Group>
    );
  }

  return (
    <Group gap={7} wrap="nowrap" align="flex-start">
      {message.failed && (
        <AlertTriangle
          size={14}
          color="var(--mantine-color-orange-5)"
          style={{ flexShrink: 0, marginTop: 3 }}
        />
      )}
      {/* `pre-wrap` so the model's own paragraph breaks survive without running
          its output through a markdown renderer — the prompt asks for plain
          sentences, and rendering markdown would reward ignoring that. */}
      <Text
        size="sm"
        lh={1.6}
        c={message.failed ? "dimmed" : undefined}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {message.content}
      </Text>
    </Group>
  );
}

/**
 * The opening screen.
 *
 * Three suggestions, no icon, no paragraph explaining what an assistant is.
 * The previous version stacked a 44px icon, a heading, three lines of prose and
 * four boxes into a 340px column, which left the thing someone came to do — ask
 * something — below the fold on a short panel.
 *
 * What the prose was there to say ("Orbit can't see your analytics") is now one
 * line under the input, where it is read at the moment it matters.
 */
function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <Center h="100%">
      <Stack gap={7} w="100%" px="xs">
        <Text size="xs" c="dimmed" mb={2}>
          Ask about anything in Quantalog
        </Text>
        {ORBIT_SUGGESTIONS.map((q) => (
          <UnstyledButton key={q} className="orbit-suggestion" onClick={() => onPick(q)}>
            <Text size="xs" lh={1.45}>{q}</Text>
          </UnstyledButton>
        ))}
      </Stack>
    </Center>
  );
}

export function OrbitChat({
  chat,
  height,
}: {
  chat: ReturnType<typeof useOrbitChat>;
  /** The thread's scroll height. The composer and hint sit below it. */
  height: number | string;
}) {
  const { messages, input, setInput, send, thinking, available, started } = chat;
  const bottom = useRef<HTMLDivElement>(null);

  // The follow-ups belong to the last thing Orbit said. Anything earlier has
  // been answered past, and stacking every turn's would fill the panel with
  // questions nobody asked.
  const last = messages[messages.length - 1];
  const followUps = last?.role === "assistant" && !last.failed ? (last.suggestions ?? []) : [];

  // Follow the conversation as it grows, including while Orbit is thinking —
  // the indicator is the thing worth keeping in view at that moment.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  if (!available) {
    return (
      <Center px="md" py="xl" h={height}>
        <Text size="sm" c="dimmed" ta="center" lh={1.6}>
          Orbit isn&apos;t set up on this server yet. Help &amp; support can still
          reach a person.
        </Text>
      </Center>
    );
  }

  return (
    <>
      <ScrollArea h={height} type="hover" scrollbarSize={6} px="md" py="md">
        {!started ? (
          <EmptyState onPick={(q) => send(q)} />
        ) : (
          <Stack gap="lg">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}

            {thinking && (
              <Group gap={7} wrap="nowrap">
                <Loader size={12} type="dots" color="gray" />
                <Text size="xs" c="dimmed">Thinking</Text>
              </Group>
            )}

            {/* Only the newest turn's follow-ups, and never while a reply is in
                flight — offering the last answer's next steps under a question
                that is still being answered invites a second question nobody
                waits for the answer to. */}
            {!thinking && followUps.length > 0 && (
              <Stack gap={6}>
                {followUps.map((q) => (
                  <UnstyledButton key={q} className="orbit-suggestion" onClick={() => send(q)}>
                    <Text size="xs" lh={1.45}>{q}</Text>
                  </UnstyledButton>
                ))}
              </Stack>
            )}
            <div ref={bottom} />
          </Stack>
        )}
      </ScrollArea>

      <Box px="md" pb="sm" pt={4}>
        <Textarea
          placeholder="Ask a question"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          // Enter sends, shift+Enter breaks a line. The opposite trips everyone
          // who has ever used a chat, and support questions are short enough
          // that the line break is the rarer of the two.
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          autosize
          minRows={1}
          maxRows={4}
          radius="md"
          disabled={thinking}
          rightSection={
            <ActionIcon
              variant={input.trim() ? "filled" : "subtle"}
              color={input.trim() ? "emerald" : "gray"}
              radius="xl"
              size="sm"
              disabled={!input.trim() || thinking}
              onClick={() => send()}
              aria-label="Send"
            >
              <ArrowUp size={13} />
            </ActionIcon>
          }
        />

        {/* One line, and it carries both caveats: what Orbit cannot see, and
            that it can be wrong. Two separate notices were two things to read
            before typing. */}
        <Text size="10px" c="dimmed" ta="center" mt={6} lh={1.4}>
          Orbit can&apos;t see your data and can be wrong.
        </Text>
      </Box>
    </>
  );
}
