import {
  Stack, Group, Button, Text, Badge, Textarea, UnstyledButton,
} from "@mantine/core";
import { ChevronRight, Check } from "lucide-react";
import type { EmailComposerState } from "../../hooks/useEmailComposer";

/**
 * Step one: who gets this.
 *
 * Its own step rather than a field on the write form because choosing the
 * audience is the expensive thing to get wrong, and on one screen it competed
 * for attention with a textarea. Counts are shown against every option so the
 * size of the send is never a surprise.
 */

/** Shared card styling — an option reads as selected by border and fill. */
function optionStyle(active: boolean) {
  return {
    border: `1px solid var(${active ? "--mantine-color-emerald-6" : "--mantine-color-default-border"})`,
    background: active ? "var(--mantine-color-emerald-light)" : undefined,
    borderRadius: 10,
    padding: "12px 14px",
  };
}

function Option({
  active,
  label,
  description,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} style={optionStyle(active)}>
      <Group justify="space-between" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Group gap={7} wrap="nowrap">
            {active && <Check size={14} />}
            <Text size="sm" fw={600}>{label}</Text>
          </Group>
          <Text size="xs" c="dimmed" mt={2}>{description}</Text>
        </div>
        <Badge variant="light" color={active ? "emerald" : "gray"} size="lg">
          {count}
        </Badge>
      </Group>
    </UnstyledButton>
  );
}

export function AudienceStep({ state }: { state: EmailComposerState }) {
  const {
    segments, segment, setSegment,
    audience, setAudience,
    customTo, setCustomTo, customList,
    canAdvance, setStep, close,
  } = state;

  return (
    <Stack gap="xs">
      {segments.map((s) => (
        <Option
          key={s.id}
          active={audience === "segment" && segment === s.id}
          label={s.label}
          description={s.description}
          count={s.count}
          onClick={() => {
            setAudience("segment");
            setSegment(s.id);
          }}
        />
      ))}

      {/* Anyone not in the database. This is how an invitation goes out — the
          people worth inviting have no account by definition. */}
      <Option
        active={audience === "custom"}
        label="Specific addresses"
        description="Type or paste addresses — they don't need an account."
        count={customList.valid.length}
        onClick={() => setAudience("custom")}
      />

      {audience === "custom" && (
        <Textarea
          autosize
          minRows={3}
          maxRows={8}
          placeholder={"alex@example.com, sam@example.com\nJordan Lee <jordan@example.com>"}
          value={customTo}
          onChange={(e) => setCustomTo(e.currentTarget.value)}
          description="Separate with commas, semicolons or new lines. Names are optional."
          error={
            customList.invalid.length
              ? `Not a valid address: ${customList.invalid.slice(0, 3).join(", ")}`
              : undefined
          }
        />
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" color="gray" onClick={close}>Cancel</Button>
        <Button
          color="emerald"
          radius="md"
          rightSection={<ChevronRight size={15} />}
          disabled={!canAdvance}
          onClick={() => setStep("write")}
        >
          Next
        </Button>
      </Group>
    </Stack>
  );
}
