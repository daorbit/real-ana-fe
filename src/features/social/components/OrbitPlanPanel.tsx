import { useEffect, useRef } from "react";
import {
  ActionIcon, Box, Button, Group, Loader, ScrollArea, Stack, Text, Textarea,
} from "@mantine/core";
import { ArrowUp, Check, RotateCcw } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { describe, type Draft } from "./draft";
import type { PlanTurn } from "../hooks/useOrbitPlan";

/** Openers, so the first turn is a choice rather than a blank box. */
const STARTERS = [
  "Post about our new feature launch, next Tuesday morning",
  "A weekly tip about web analytics, every Monday at 9am",
  "Share this month's traffic milestone tomorrow",
];

/**
 * Orbit, scheduling the post by asking for it.
 *
 * The composer's own fields stay the source of truth — this fills them and
 * never replaces them. Two reasons it is a conversation rather than a single
 * "write it for me" box: a scheduled post needs two separate decisions, and
 * someone who arrives with only the topic should be asked for the timing
 * rather than handed a guess.
 *
 * Nothing here publishes. Orbit proposes; the confirm below hands control back
 * to the composer, where the author sees every field and the live preview
 * before they press Schedule.
 */
export function OrbitPlanPanel({
  draft,
  turns,
  input,
  onInput,
  onSend,
  thinking,
  ready,
  error,
  onReset,
  onAccept,
  onSchedule,
  scheduling,
  blockedReason,
}: {
  draft: Draft;
  turns: PlanTurn[];
  input: string;
  onInput: (value: string) => void;
  onSend: (text?: string) => void;
  thinking: boolean;
  /** Orbit has everything and is waiting to be confirmed. */
  ready: boolean;
  error: string;
  onReset: () => void;
  /** Keep the filled fields and go back to editing them by hand. */
  onAccept: () => void;
  /** Schedule it now, exactly as the fields stand. */
  onSchedule: () => void;
  scheduling: boolean;
  /** Why this cannot be scheduled yet — an Instagram post with no image, say.
   *  Empty when it can. Orbit writes words; it cannot supply a missing image. */
  blockedReason?: string;
}) {
  const thread = useRef<HTMLDivElement | null>(null);

  // Follow the conversation down. Without this the question Orbit just asked
  // sits below the fold, which reads as no reply at all.
  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, thinking]);

  const started = turns.length > 0;

  return (
    <Box
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
        background: "var(--surface-2)",
        overflow: "hidden",
      }}
    >
      <Group justify="space-between" px={12} py={9} wrap="nowrap" style={{ borderBottom: started ? "1px solid var(--mantine-color-default-border)" : "none" }}>
        <Group gap={8} wrap="nowrap">
          <OrbitMark size={18} />
          <Text size="sm" fw={600}>Schedule with Orbit</Text>
        </Group>
        {started ? (
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={onReset} aria-label="Start over" title="Start over">
            <RotateCcw size={14} />
          </ActionIcon>
        ) : (
          <Text size="xs" c="dimmed">Costs one Orbit question per reply</Text>
        )}
      </Group>

      {started && (
        <ScrollArea.Autosize mah={260} viewportRef={thread} type="auto">
          <Stack gap={10} p={12}>
            {turns.map((t, i) => (
              <Group
                key={i}
                justify={t.role === "user" ? "flex-end" : "flex-start"}
                wrap="nowrap"
                align="flex-start"
              >
                {t.role === "assistant" && <Box pt={2}><OrbitMark size={16} /></Box>}
                <Box
                  px={11}
                  py={8}
                  style={{
                    maxWidth: "82%",
                    borderRadius: 10,
                    background: t.role === "user" ? "var(--accent-soft)" : "var(--surface)",
                    border: "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  <Text size="13px" style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                    {t.content}
                  </Text>
                </Box>
              </Group>
            ))}

            {thinking && (
              <Group gap={8} wrap="nowrap">
                <OrbitMark size={16} />
                <Loader size={14} type="dots" />
              </Group>
            )}

            {error && <Text size="xs" c="red">{error}</Text>}

            {/* The proposal, spelled out. The caption is already in the field
                above and the preview beside it — what this adds is the schedule
                in words, which is the half nobody can read off a text box. */}
            {ready && !thinking && (
              <Box
                p={12}
                style={{
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--mantine-radius-md)",
                  background: "var(--surface)",
                }}
              >
                <Text size="xs" c="dimmed" mb={4}>Publishes</Text>
                <Text size="sm" fw={600} mb={blockedReason ? 6 : 10}>{describe(draft)}</Text>
                {blockedReason && (
                  <Text size="xs" c="red" mb={10}>{blockedReason}</Text>
                )}
                <Group gap="sm" wrap="nowrap">
                  <Button
                    size="xs"
                    color="emerald"
                    loading={scheduling}
                    disabled={!!blockedReason}
                    leftSection={<Check size={14} />}
                    onClick={onSchedule}
                  >
                    Schedule it
                  </Button>
                  <Button size="xs" variant="default" onClick={onAccept} disabled={scheduling}>
                    Edit first
                  </Button>
                </Group>
              </Box>
            )}
          </Stack>
        </ScrollArea.Autosize>
      )}

      <Box p={12} pt={started ? 0 : 4}>
        {!started && (
          <Group gap={6} mb={10} wrap="wrap">
            {STARTERS.map((s) => (
              <Button
                key={s}
                size="compact-xs"
                variant="default"
                onClick={() => onSend(s)}
                disabled={thinking}
                style={{ fontWeight: 500 }}
              >
                {s}
              </Button>
            ))}
          </Group>
        )}

        <Group gap="sm" align="flex-end" wrap="nowrap">
          <Textarea
            autosize
            minRows={1}
            maxRows={4}
            placeholder={started ? "Reply to Orbit…" : "Tell Orbit what to post, and when"}
            value={input}
            onChange={(e) => onInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              // Enter sends, shift+enter breaks the line — the same as every
              // other message box the author uses all day.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <ActionIcon
            size="lg"
            color="emerald"
            variant="filled"
            loading={thinking}
            disabled={!input.trim()}
            onClick={() => onSend()}
            aria-label="Send to Orbit"
          >
            <ArrowUp size={17} />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  );
}
