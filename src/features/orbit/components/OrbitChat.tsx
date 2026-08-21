import { useCallback, useEffect, useRef } from "react";
import {
  Stack, Group, Text, Textarea, ActionIcon, ScrollArea, Center,
  UnstyledButton, Loader, Box, Anchor, Menu, Tooltip, Code,
} from "@mantine/core";
import { ArrowUp, AlertTriangle, Check, Lock, Mic, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSpeechInput } from "@/shared/hooks/useSpeechInput";
import { ModelIcon } from "@/features/orbit/components/ModelIcon";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { useOrbitOptional } from "@/features/orbit/components/OrbitProvider";
import { ORBIT_SUGGESTIONS, type OrbitMessage } from "@/features/orbit/useOrbitChat";
import type { useOrbitChat } from "@/features/orbit/useOrbitChat";

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
        {/* A solid fill, not Mantine's `-light` tint. That tint is mostly
            transparent, so the aurora behind the panel showed straight through
            it and the user's own words came out muddy. */}
        <Box
          className="orbit-bubble-user"
          style={{
            maxWidth: "85%",
            padding: "7px 12px",
            borderRadius: 14,
            borderBottomRightRadius: 4,
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
      <div style={{ minWidth: 0 }}>
        <Text
          size="sm"
          lh={1.6}
          c={message.failed ? "dimmed" : undefined}
          style={{ whiteSpace: "pre-wrap" }}
        >
          <RichText text={message.content} />
        </Text>
        {/* Present only when the server fell through to a different model than
            the one chosen — silence there would make the picker look broken to
            anyone who noticed the answer's style change. */}
        {message.modelLabel && (
          <Text size="10px" c="dimmed" mt={4}>
            Answered by {message.modelLabel}
          </Text>
        )}
      </div>
    </Group>
  );
}


const INLINE = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(`[^`\n]+`)|(\*\*[^*\n]+\*\*)/g;

function RichText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > cursor) out.push(text.slice(cursor, at));

    const [token, link, code, bold] = match;

    if (link) {
      // Split rather than a second regex: the label can contain anything except
      // a bracket, and the href anything except whitespace or a paren.
      const close = link.indexOf("](");
      const label = link.slice(1, close);
      const href = link.slice(close + 2, -1);
      out.push(
        <Anchor
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          c="emerald.5"
          fw={500}
          underline="always"
        >
          {label}
        </Anchor>,
      );
    } else if (code) {
      out.push(
        <Code key={key++} style={{ fontSize: "0.85em", wordBreak: "break-all" }}>
          {code.slice(1, -1)}
        </Code>,
      );
    } else if (bold) {
      out.push(
        <Text key={key++} span fw={600} c="var(--mantine-color-text)" inherit>
          {bold.slice(2, -2)}
        </Text>,
      );
    }

    cursor = at + token.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));

  return <>{out}</>;
}

 
function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
   
    <Stack gap="lg" px="xs" pt={4}>
      <Stack gap={6} align="center">
        <OrbitMark size={50} />
        <Text size="sm" fw={650} ta="center">
          Chat with Orbit AI
        </Text>
        <Text size="xs" c="dimmed" ta="center" lh={1.5} maw={280}>
          Ask about any metric, report or setting in Quantalog and get a
          step-by-step answer.
        </Text>
      </Stack>

      <Stack gap={7}>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          Try asking
        </Text>
        {ORBIT_SUGGESTIONS.map((q) => (
          <UnstyledButton key={q} className="orbit-suggestion" onClick={() => onPick(q)}>
            <Text size="xs" lh={1.45}>{q}</Text>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
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
  const {
    messages, input, setInput, send, thinking, available, started,
    models, model, setModel, plan,
  } = chat;
  const bottom = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Optional: this component also renders on the Help & support page, where
  // there is no floating panel to close.
  const orbit = useOrbitOptional();

  /** Send someone to Billing, closing the panel so it isn't left floating over it. */
  const goToBilling = () => {
    orbit?.close();
    navigate("/app/billing");
  };

  const activeLabel = models.find((m) => m.id === model)?.label ?? "default";

 
  const dictationBase = useRef("");

  const onTranscript = useCallback(
    (text: string, final: boolean) => {
      const base = dictationBase.current;
      const joined = base && !base.endsWith(" ") ? `${base} ${text}` : base + text;
      if (final) dictationBase.current = joined;
      setInput(joined);
    },
    [setInput],
  );

  const speech = useSpeechInput({ onTranscript });

  const toggleDictation = () => {
    // Start from whatever is in the field, so dictation adds to a half-typed
    // question rather than throwing it away.
    if (!speech.listening) dictationBase.current = input;
    speech.toggle();
  };

  // Sending mid-sentence would leave the recogniser running against a field
  // that has just been cleared, and the next phrase would arrive appended to
  // the question already in flight.
  const sendAndStop = (q?: string) => {
    if (speech.listening) speech.stop();
    dictationBase.current = "";
    send(q);
  };

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
          <EmptyState onPick={(q) => sendAndStop(q)} />
        ) : (
          <Stack gap="lg">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}

          
            {thinking && (
              <Group gap={8} wrap="nowrap">
                <Loader size={12} type="dots" color="var(--mantine-color-emerald-5)" />
                <Text size="xs" c="emerald.4" fw={500} className="orbit-thinking">
                  Thinking
                </Text>
              </Group>
            )}

      
            {!thinking && followUps.length > 0 && (
              <Stack gap={6}>
                {followUps.map((q) => (
                  <UnstyledButton key={q} className="orbit-suggestion" onClick={() => sendAndStop(q)}>
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
      
          placeholder={speech.listening ? "Listening — speak your question" : "Ask a question"}
          value={input}
          onChange={(e) => {
            setInput(e.currentTarget.value);
          
            if (speech.listening) dictationBase.current = e.currentTarget.value;
          }}
          styles={{
            input: {
             
              paddingLeft: 42,
              paddingTop: 5,
              paddingBottom: 5,
            
              background: "var(--mantine-color-default)",
              borderColor: "var(--mantine-color-default-border)",
            },
            section: { alignItems: "center" },
          }}
          leftSection={
            models.length > 1 ? (
              <Menu position="top-start" withArrow shadow="md" radius="md" width={262}>
                <Menu.Target>
                  <Tooltip label={`Model: ${activeLabel}`} withArrow position="top">
                    <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Choose model">
                      <ModelIcon id={model} size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Answer with</Menu.Label>
                  {models.map((m) => (
                    <Menu.Item
                      key={m.id}
                  
                      onClick={() => (m.locked ? goToBilling() : setModel(m.id))}
                      leftSection={
                        <span style={{ opacity: m.locked ? 0.4 : 1, display: "inline-flex" }}>
                          <ModelIcon id={m.id} size={16} />
                        </span>
                      }
                      rightSection={
                        m.locked ? (
                          <Lock size={12} style={{ opacity: 0.55 }} />
                        ) : m.id === model ? (
                          <Check size={13} />
                        ) : undefined
                      }
                      // Without a bounded width the label section grows to fit
                      // its content and `truncate` never engages.
                      styles={{ itemLabel: { minWidth: 0 } }}
                    >
                      {/* Both lines truncate rather than wrap. A menu where one
                          row is twice the height of its neighbours stops being
                          scannable, which is the only reason to have icons. */}
                      <Text
                        size="sm"
                        fw={m.id === model ? 600 : 400}
                        lh={1.3}
                        c={m.locked ? "dimmed" : undefined}
                        truncate
                      >
                        {m.label}
                      </Text>
                      <Text size="xs" c={m.locked ? "emerald.5" : "dimmed"} lh={1.35} truncate>
                        {m.locked ? "Out of questions" : m.hint}
                      </Text>
                    </Menu.Item>
                  ))}

                  {/* Every row locks together, so this only needs to say what
                      to do about it, not which model it unlocks. */}
                  {models.some((m) => m.locked) && (
                    <>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<OrbitMark size={14} />}
                        onClick={() => goToBilling()}
                      >
                        <Text size="xs" c="dimmed" lh={1.35}>
                          {plan?.name ?? "Your plan"} is out of questions this period. Upgrade
                          or buy a pack
                        </Text>
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            ) : undefined
          }
          // Enter sends, shift+Enter breaks a line. The opposite trips everyone
          // who has ever used a chat, and support questions are short enough
          // that the line break is the rarer of the two.
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendAndStop();
            }
          }}
          autosize
          minRows={1}
          maxRows={4}
          radius="md"
          disabled={thinking}
          // Two controls where Mantine sizes for one, so the mic would sit
          // under the send button at the default width.
          rightSectionWidth={speech.supported ? 62 : undefined}
          rightSection={
            <Group gap={2} wrap="nowrap" justify="flex-end" pr={2}>
              {/* Absent rather than disabled on a browser without a recogniser.
                  A greyed mic invites a click that can never do anything, and
                  there is nothing the user could change to fix it. */}
              {speech.supported && (
                <Tooltip
                  label={speech.listening ? "Stop dictating" : "Dictate your question"}
                  withArrow
                  position="top"
                >
                  <ActionIcon
                    variant={speech.listening ? "filled" : "subtle"}
                    color={speech.listening ? "red" : "gray"}
                    radius="xl"
                    size="sm"
                    disabled={thinking}
                    onClick={toggleDictation}
                    aria-label={speech.listening ? "Stop dictating" : "Dictate your question"}
                    aria-pressed={speech.listening}
                  >
                    {/* A stop square while live, not a second mic. The mic is
                        what turns it on, so leaving it there gives no sign that
                        pressing again is what turns it off. */}
                    {speech.listening ? <Square size={11} /> : <Mic size={13} />}
                  </ActionIcon>
                </Tooltip>
              )}
              <ActionIcon
                variant={input.trim() ? "filled" : "subtle"}
                color={input.trim() ? "emerald" : "gray"}
                radius="xl"
                size="sm"
                disabled={!input.trim() || thinking}
                onClick={() => sendAndStop()}
                aria-label="Send"
              >
                <ArrowUp size={13} />
              </ActionIcon>
            </Group>
          }
        />

        {/* One line, and it carries both caveats: what Orbit cannot see, and
            that it can be wrong. Two separate notices were two things to read
            before typing. */}
        {/* The microphone failure takes this line rather than adding one. It is
            about the thing just attempted, so it is what someone needs at that
            moment — and a blocked mic is fixed in browser settings, which is
            worth saying where it will be read. */}
        <Text
          size="10px"
          c={speech.error ? "orange.5" : "dimmed"}
          ta="center"
          mt={6}
          lh={1.4}
        >
          {speech.error ?? "Orbit can't see your data and can be wrong."}
        </Text>
      </Box>
    </>
  );
}
