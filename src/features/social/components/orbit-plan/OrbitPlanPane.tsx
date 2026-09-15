import { useEffect, useRef } from "react";
import { ActionIcon, Box, Button, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { PlanMessage } from "./PlanMessage";
import { PlanConfirm } from "./PlanConfirm";
import { PlanImagePrompt } from "./PlanImagePrompt";
import { PlanError } from "./PlanError";
import { PlanInput } from "./PlanInput";
import { startersFor } from "./starters";
import type { Draft } from "../draft";
import type { PlanTurn } from "../../hooks/useOrbitPlan";

/**
 * Orbit, planning the post in the right-hand pane.
 *
 * Same look as the full Orbit AI page — no card, no border, no background
 * wash — so this reads as Orbit itself sitting in the pane, not a boxed-off
 * widget version of it.
 */
export function OrbitPlanPane({
  draft,
  onImages,
  turns,
  input,
  onInput,
  onSend,
  onRetry,
  thinking,
  ready,
  awaitingImage,
  error,
  onReset,
  onEdit,
  onSchedule,
  scheduling,
  blockedReason,
}: {
  draft: Draft;
  onImages: (next: string[]) => void;
  turns: PlanTurn[];
  input: string;
  onInput: (value: string) => void;
  onSend: (text?: string) => void;
  onRetry: () => void;
  thinking: boolean;
  ready: boolean;
  awaitingImage: boolean;
  error: string;
  onReset: () => void;
  onEdit: () => void;
  onSchedule: () => void;
  scheduling: boolean;
  blockedReason?: string;
}) {
  const thread = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, thinking, awaitingImage, ready]);

  const started = turns.length > 0;

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {started && (
        <Group justify="flex-end" px={4} pb={10} wrap="nowrap">
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            leftSection={<RotateCcw size={13} />}
            onClick={onReset}
          >
            Start over
          </Button>
        </Group>
      )}

      {/* Native overflow rather than a ScrollArea: the app's own thin scrollbar
          is styled globally, and Mantine's overlay bar reads as a different
          control sitting on top of the panel. */}
      <Box
        ref={thread}
        style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
        data-state={started ? undefined : "empty"}
      >
        {!started ? (
          <Intro
            provider={draft.provider}
            input={input}
            onInput={onInput}
            onSend={onSend}
            thinking={thinking}
          />
        ) : (
          <Stack gap={14} px={4} py={10} maw={720} mx="auto">
            {turns.map((t, i) => <PlanMessage key={i} turn={t} />)}

            {thinking && (
              <Group gap={9} wrap="nowrap">
                <OrbitMark size={18} />
                <Loader size={15} type="dots" />
              </Group>
            )}

            {error && !thinking && (
              <PlanError message={error} onRetry={onRetry} retrying={thinking} />
            )}

            {awaitingImage && !thinking && (
              <PlanImagePrompt
                images={draft.images}
                onImages={onImages}
                provider={draft.provider}
                optional={draft.provider !== "instagram"}
                onSkip={() => onSend("No image for this one.")}
              />
            )}

            {ready && !thinking && (
              <PlanConfirm
                draft={draft}
                blockedReason={blockedReason}
                scheduling={scheduling}
                onSchedule={onSchedule}
                onEdit={onEdit}
              />
            )}
          </Stack>
        )}
      </Box>

      {started && (
        <Box px={4} pt={10} maw={720} w="100%" style={{ margin: "0 auto" }}>
          <PlanInput
            value={input}
            onChange={onInput}
            onSend={() => onSend()}
            thinking={thinking}
            placeholder="Reply to Orbit…"
            minRows={2}
          />
          <Text size="10.5px" c="dimmed" mt={8} ta="center">
            Orbit fills the form — nothing publishes until you confirm.
          </Text>
        </Box>
      )}
    </Box>
  );
}

/** The blank state: title and a line of context up top, the composer
 * centered, starter pills below it in a horizontal scroller — a row that can
 * hold more starters than the composer is wide without wrapping into a
 * block. */
function Intro({
  provider,
  input,
  onInput,
  onSend,
  thinking,
}: {
  provider: Draft["provider"];
  input: string;
  onInput: (value: string) => void;
  onSend: (text?: string) => void;
  thinking: boolean;
}) {
  const starters = startersFor(provider);
  const scroller = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <Stack gap={24} align="center" justify="center" h="100%" px={8} py={20}>
      <Stack gap={4} align="center">
        <Text size="md" fw={500} ta="center">Let's plan a post</Text>
        <Text size="xs" c="dimmed" ta="center" maw={360}>
          Say what you want to share — Orbit writes it, asks for anything it's missing, and
          fills the form for you.
        </Text>
      </Stack>

      <Box w="100%" maw={720}>
        <PlanInput
          value={input}
          onChange={onInput}
          onSend={() => onSend()}
          thinking={thinking}
          placeholder="Tell Orbit what to post, and when"
          minRows={3}
        />
      </Box>

      <Group gap={6} wrap="nowrap" w="100%" maw={720}>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          radius="xl"
          onClick={() => scrollBy(-160)}
          aria-label="Scroll starters left"
        >
          <ChevronLeft size={14} />
        </ActionIcon>

        <Group
          ref={scroller}
          gap={8}
          wrap="nowrap"
          style={{ flex: 1, overflowX: "auto", scrollbarWidth: "none" }}
        >
          {starters.map((s) => (
            <UnstyledButton
              key={s.label}
              className="orbit-plan-starter"
              disabled={thinking}
              onClick={() => onSend(s.prompt)}
              style={{ flexShrink: 0 }}
            >
              <Text size="xs" lh={1.4} style={{ whiteSpace: "nowrap" }}>{s.label}</Text>
            </UnstyledButton>
          ))}
        </Group>

        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          radius="xl"
          onClick={() => scrollBy(160)}
          aria-label="Scroll starters right"
        >
          <ChevronRight size={14} />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
