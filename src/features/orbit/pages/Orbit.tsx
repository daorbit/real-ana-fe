import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Button, Center, Group, Loader, ScrollArea, Stack, Text, Textarea, Title,
  Tooltip, UnstyledButton,
} from "@mantine/core";
import { AlertTriangle, ArrowUp, History, Mic, RotateCcw, Square } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useSpeechInput } from "@/shared/hooks/useSpeechInput";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { ModelPicker } from "@/features/orbit/components/ModelPicker";
import { RichText } from "@/features/orbit/components/RichText";
import { useOrbit } from "@/features/orbit/components/OrbitProvider";
import { ORBIT_SUGGESTIONS, type OrbitMessage } from "@/features/orbit/useOrbitChat";
import { OrbitHistoryDrawer } from "./OrbitHistoryDrawer";
import classes from "./orbitPage.module.css";

 
function Turn({ message }: { message: OrbitMessage }) {
  if (message.role === "user") {
    return (
      <Group justify="flex-end" wrap="nowrap">
        <Box className={classes.userTurn}>
          <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
        </Box>
      </Group>
    );
  }
 
  return (
    <Group gap={12} wrap="nowrap" align="flex-start">
      <Box style={{ flexShrink: 0, marginTop: 1 }}>
        {message.failed ? (
          <AlertTriangle size={17} color="var(--mantine-color-orange-5)" />
        ) : (
          <OrbitMark size={22} />
        )}
      </Box>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text
          size="sm"
          lh={1.7}
          c={message.failed ? "dimmed" : undefined}
          style={{ whiteSpace: "pre-wrap" }}
        >
          <RichText text={message.content} />
        </Text>
        {/* Present only when the server fell through to a different model than
            the one chosen — silence there would make the picker look broken to
            anyone who noticed the answer's style change. */}
        {message.modelLabel && (
          <Text size="10px" c="dimmed" mt={5}>
            Answered by {message.modelLabel}
          </Text>
        )}
      </div>
    </Group>
  );
}

export default function Orbit() {
  // The page reads the provider's chat rather than calling the hook, so it is
  // the same conversation the bubble holds.
  const { chat } = useOrbit();
  const { messages, input, setInput, send, thinking, available, started } = chat;

  const [historyOpen, setHistoryOpen] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  /*
   * Marks the body while Orbit is on screen.
   *
   * The panel's scroller and the router's fade wrapper are both auto-height, so
   * a `height: 100%` page collapses inside them and the composer floats up
   * under the last message instead of sitting on the floor. Giving those two
   * boxes a height — for this page only — is what lets the thread scroll under
   * a pinned composer. Lead Capture marks the body the same way for the same
   * kind of reason.
   */
  useEffect(() => {
    document.body.dataset.page = "orbit";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

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
 
    if (!speech.listening) dictationBase.current = input;
    speech.toggle();
  };

 
  const sendAndStop = (q?: string) => {
    if (speech.listening) speech.stop();
    dictationBase.current = "";
    send(q);
  };
 
  const last = messages[messages.length - 1];
  const followUps = last?.role === "assistant" && !last.failed ? (last.suggestions ?? []) : [];
 
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  if (!available) {
    return (
      <AppShell>
        <Center h={320} px="md">
          <Stack gap={8} align="center" maw={420}>
            <OrbitMark size={44} />
            <Text size="sm" c="dimmed" ta="center" lh={1.6}>
              Orbit isn&apos;t set up on this server yet. Help &amp; support can still reach a
              person.
            </Text>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const empty = !input.trim();

 
  const composer = (
    <div className={classes.composerWrap}>
      <div className={classes.composer}>
        <Textarea
          placeholder={speech.listening ? "Listening — speak your question" : "Ask anything"}
          value={input}
          onChange={(e) => {
            setInput(e.currentTarget.value);
            if (speech.listening) dictationBase.current = e.currentTarget.value;
          }}
 
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendAndStop();
            }
          }}
          variant="unstyled"
          autosize
 
          minRows={started ? 1 : 3}
          maxRows={started ? 8 : 10}
          px="md"
          pt="sm"
          disabled={thinking}
          data-autofocus
 
          styles={{
            input: {
              fontSize: 15,
              lineHeight: 1.6,
              background: "transparent",
              border: "none",
              boxShadow: "none",
            },
          }}
        />

        <div className={classes.composerFoot}>
          <Group gap={4} wrap="nowrap">
            <ModelPicker chat={chat} variant="labelled" />
            <Text size="xs" c="dimmed">
              {thinking ? "Orbit is thinking…" : "Enter to send"}
            </Text>
          </Group>

          <Group gap={4} wrap="nowrap">
          
            {speech.supported && (
              <Tooltip
                label={speech.listening ? "Stop dictating" : "Dictate your question"}
                withArrow
              >
                <ActionIcon
                  variant={speech.listening ? "filled" : "subtle"}
                  color={speech.listening ? "red" : "gray"}
                  radius="xl"
                  size="md"
                  disabled={thinking}
                  onClick={toggleDictation}
                  aria-label={speech.listening ? "Stop dictating" : "Dictate your question"}
                  aria-pressed={speech.listening}
                >
                  {/* A stop square while live, not a second mic. The mic is what
                      turns it on, so leaving it there gives no sign that
                      pressing again is what turns it off. */}
                  {speech.listening ? <Square size={12} /> : <Mic size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
            {/* Named, not a bare arrow. It is the one action the composer is
                for, and there is room here to say so — the panel's icon-only
                button was a concession to 400px that this page does not have to
                make. */}
            <Button
              color="emerald"
              radius="xl"
              size="sm"
              leftSection={<ArrowUp size={15} />}
              disabled={empty || thinking}
              loading={thinking}
              onClick={() => sendAndStop()}
            >
              Send
            </Button>
          </Group>
        </div>
      </div>

 
      <Text size="10px" c={speech.error ? "orange.5" : "dimmed"} ta="center" mt={8} lh={1.4}>
        {speech.error ?? "Orbit can't see your data and can be wrong."}
      </Text>
    </div>
  );

  return (
    <AppShell>
      <div className={classes.page}>
        <div className={classes.header}>
       
        <Text size="sm" fw={650}>
          Orbit AI
        </Text>

        <Group gap={2} wrap="nowrap">
          {/* "Start over" leaves the current thread rather than deleting it —
              it is saved, and the drawer is how you get back. */}
          {started && (
            <Tooltip label="Start over" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={chat.reset}
                aria-label="Start over"
              >
                <RotateCcw size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Conversations" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={() => setHistoryOpen(true)}
              aria-label="Conversations"
            >
              <History size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <div className={classes.body} data-state={started ? "started" : "empty"}>
        {!started ? (
          <div className={classes.hero}>
            <div className={classes.heroHead}>
              <Title order={2} fw={500} className={classes.heroTitle}>
                How can Orbit help today?
              </Title>
            </div>
            {composer}

            {/* Under the composer, not above it: the box is what the page is
                for, and these are the fallback for someone who does not yet
                know what to type into it. */}
            <div className={classes.starters}>
              {ORBIT_SUGGESTIONS.map((q) => (
                <UnstyledButton
                  key={q}
                  className={classes.starter}
                  onClick={() => sendAndStop(q)}
                >
                  <Text size="xs" lh={1.4}>
                    {q}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className={classes.scroll} type="hover" scrollbarSize={7}>
              <div className={classes.column}>
                <Stack gap={26}>
                  {messages.map((m) => (
                    <Turn key={m.id} message={m} />
                  ))}

                  {thinking && (
                    <Group gap={12} wrap="nowrap">
                      <OrbitMark size={22} />
                      <Group gap={7} wrap="nowrap">
                        <Loader size={13} type="dots" color="var(--mantine-color-emerald-5)" />
                        <Text size="xs" c="emerald.4" fw={500} className="orbit-thinking">
                          Thinking
                        </Text>
                      </Group>
                    </Group>
                  )}

                  {!thinking && followUps.length > 0 && (
                    // Indented to the column the answers start at, so the
                    // follow-ups read as continuing the last one rather than as
                    // a new turn from somewhere else.
                    <div className={classes.followUps}>
                      {followUps.map((q) => (
                        <UnstyledButton
                          key={q}
                          className={classes.starter}
                          onClick={() => sendAndStop(q)}
                        >
                          <Text size="xs" lh={1.4}>
                            {q}
                          </Text>
                        </UnstyledButton>
                      ))}
                    </div>
                  )}

                  <div ref={bottom} />
                </Stack>
              </div>
            </ScrollArea>

            {composer}
          </>
        )}
      </div>

        <OrbitHistoryDrawer
          chat={chat}
          opened={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </AppShell>
  );
}
