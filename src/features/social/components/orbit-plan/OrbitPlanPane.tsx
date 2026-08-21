import { useEffect, useRef } from "react";
import { Box, Button, Group, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { RotateCcw } from "lucide-react";
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
 * Wears the same surface as the floating assistant — aurora wash, filled user
 * bubble, plain replies — so it reads as the same Orbit rather than a second
 * chatbot with its own manners.
 */
export function OrbitPlanPane({
  draft,
  onImage,
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
  onImage: (next: string) => void;
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
    <Box className="orbit-plan-pane">
      <div className="aurora-wash" />

      <Group
        justify="space-between"
        px={16}
        py={12}
        wrap="nowrap"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <Group gap={10} wrap="nowrap">
          <OrbitMark size={22} />
          <div>
            <Text size="sm" fw={650} lh={1.2}>Orbit</Text>
            <Text size="11px" c="dimmed">Writes the post and picks the slot with you</Text>
          </div>
        </Group>
        {started && (
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            leftSection={<RotateCcw size={13} />}
            onClick={onReset}
          >
            Start over
          </Button>
        )}
      </Group>

      {/* Native overflow rather than a ScrollArea: the app's own thin scrollbar
          is styled globally, and Mantine's overlay bar reads as a different
          control sitting on top of the panel. */}
      <Box ref={thread} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <Stack gap={14} px={16} py={18}>
          {!started && <Intro provider={draft.provider} onSend={onSend} thinking={thinking} />}

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
              image={draft.image}
              onImage={onImage}
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
      </Box>

      <Box px={16} pt={12} pb={14} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
        <PlanInput
          value={input}
          onChange={onInput}
          onSend={() => onSend()}
          thinking={thinking}
          placeholder={started ? "Reply to Orbit…" : "Tell Orbit what to post, and when"}
        />
        <Text size="10.5px" c="dimmed" mt={8} ta="center">
          Orbit fills the form — nothing publishes until you confirm.
        </Text>
      </Box>
    </Box>
  );
}

/** The blank state: what this does, and a few ways in. */
function Intro({
  provider,
  onSend,
  thinking,
}: {
  provider: Draft["provider"];
  onSend: (text: string) => void;
  thinking: boolean;
}) {
  return (
    <Stack gap={18}>
      <Stack gap={8} align="center" py={10}>
        <OrbitMark size={40} />
        <Text size="md" fw={650} ta="center">Let's plan a post</Text>
        <Text size="xs" c="dimmed" ta="center" lh={1.55} maw={330}>
          Say what you want to share. Orbit writes it, asks for anything it is missing,
          and fills the form for you to check.
        </Text>
      </Stack>

      <Stack gap={7}>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
          Start with
        </Text>
        {startersFor(provider).map((s) => (
          <UnstyledButton
            key={s.label}
            className="orbit-suggestion"
            disabled={thinking}
            onClick={() => onSend(s.prompt)}
          >
            <Text size="xs" fw={600} lh={1.4}>{s.label}</Text>
            <Text size="11px" c="dimmed" lh={1.4} mt={2}>{s.hint}</Text>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
  );
}
