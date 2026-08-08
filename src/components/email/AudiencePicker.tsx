import {
  Stack, Group, Text, Textarea, UnstyledButton, Collapse, ScrollArea, Loader,
} from "@mantine/core";
import { Check, ChevronDown, ChevronRight, Users } from "lucide-react";
import type { AdminUser } from "../../types";
import type { EmailComposerState } from "../../hooks/useEmailComposer";

/**
 * Who the message goes to.
 *
 * Previously its own step, on a screen you left before writing anything. That
 * split the two decisions that inform each other — you pick a segment to decide
 * what to say, and you change your mind about the segment once you have said it
 * — and it meant the audience was invisible for the entire time you were
 * writing. Now it sits beside the message and stays on screen.
 *
 * Two rules run through the layout:
 *
 *  - a count is never a bare number. "0" next to an option reads as disabled,
 *    not as "you haven't typed any addresses yet", so every count carries the
 *    noun it counts.
 *  - the selected option is never only a colour. It gets a tick as well, since
 *    an emerald fill on a dark panel is a weak signal and no signal at all to
 *    anyone who cannot separate the two hues.
 */

function Option({
  active,
  label,
  description,
  count,
  countLabel,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  description: string;
  count: number;
  /** What the number counts, so it is never a bare digit. */
  countLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `1px solid var(${active ? "--mantine-color-emerald-6" : "--mantine-color-default-border"})`,
        background: active ? "var(--mantine-color-emerald-light)" : undefined,
        borderRadius: 8,
        padding: "9px 11px",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <Group gap={7} wrap="nowrap" align="flex-start">
        {/* A fixed-width slot, so labels line up whether or not a tick is
            showing — otherwise selecting an option shifts its own text. */}
        <div style={{ width: 14, flexShrink: 0, paddingTop: 2 }}>
          {active && <Check size={14} />}
        </div>
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} lh={1.35}>{label}</Text>
          <Text size="xs" c="dimmed" mt={2} lh={1.45}>{description}</Text>
          <Text size="xs" c={active ? "emerald.6" : "dimmed"} fw={600} mt={4}>
            {count === 0 ? countLabel : `${count} ${countLabel}`}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}

export function AudiencePicker({
  state,
  user,
}: {
  state: EmailComposerState;
  user?: AdminUser | null;
}) {
  const {
    single,
    segments, segment, setSegment,
    audience, setAudience,
    customTo, setCustomTo, customList,
    recipients, loadingRecipients,
    showList, setShowList,
    busy,
  } = state;

  // Addressing one account has no choice to make — showing a picker with a
  // single locked option would be a control that does nothing.
  if (single) {
    return (
      <Stack gap={6}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.5px" }}>
          To
        </Text>
        <Text size="sm" fw={600}>{user?.name}</Text>
        <Text size="xs" c="dimmed">{user?.email}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.5px" }}>
        Who gets this
      </Text>

      {segments.map((s) => (
        <Option
          key={s.id}
          active={audience === "segment" && segment === s.id}
          label={s.label}
          description={s.description}
          count={s.count}
          countLabel={s.count === 1 ? "person" : "people"}
          disabled={busy}
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
        label="Type addresses myself"
        description="Paste any addresses — they don't need an account."
        count={customList.valid.length}
        countLabel={
          customList.valid.length === 0
            ? "none typed yet"
            : customList.valid.length === 1
              ? "address"
              : "addresses"
        }
        disabled={busy}
        onClick={() => setAudience("custom")}
      />

      {audience === "custom" && (
        <Textarea
          autosize
          minRows={3}
          maxRows={7}
          disabled={busy}
          placeholder={"alex@example.com, sam@example.com\nJordan Lee <jordan@example.com>"}
          value={customTo}
          onChange={(e) => setCustomTo(e.currentTarget.value)}
          description="Commas, semicolons or new lines. Names optional."
          error={
            customList.invalid.length
              ? `Not a valid address: ${customList.invalid.slice(0, 3).join(", ")}`
              : undefined
          }
        />
      )}

      {/* The running total, and the only place the exact names can be checked.
          Sending is not undoable, so being able to read the list at all is what
          makes a wrong pick recoverable — but it stays folded, because it is
          reassurance before Send rather than something to watch while typing. */}
      <div
        style={{
          borderTop: "1px solid var(--mantine-color-default-border)",
          paddingTop: 10,
          marginTop: 2,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap={7} wrap="nowrap">
            <Users size={14} />
            <Text size="sm" fw={600}>
              {loadingRecipients ? (
                <Loader size={12} />
              ) : recipients.length === 0 ? (
                "Nobody selected"
              ) : (
                `Sends to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}`
              )}
            </Text>
          </Group>
          {recipients.length > 0 && (
            <UnstyledButton onClick={() => setShowList((v) => !v)}>
              <Group gap={3}>
                <Text size="xs" c="emerald.6" fw={600}>
                  {showList ? "Hide" : "Check"}
                </Text>
                {showList ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </Group>
            </UnstyledButton>
          )}
        </Group>

        <Collapse expanded={showList}>
          <ScrollArea.Autosize mah={150} mt="xs">
            <Stack gap={2}>
              {recipients.map((r) => (
                // Keyed on the address: a hand-entered recipient has no id, and
                // the address is unique either way — the parser drops duplicates.
                <Text key={r.email} size="xs" c="dimmed">
                  {r.name ? `${r.name} · ` : ""}{r.email}
                </Text>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        </Collapse>
      </div>
    </Stack>
  );
}
