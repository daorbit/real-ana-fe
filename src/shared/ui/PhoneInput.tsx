import { Group, Text, TextInput, Select } from "@mantine/core";
import { DIAL_CODES, type DialCode } from "@/shared/lib/dialCodes";

/**
 * A phone field with an explicit country.
 *
 * The country is a separate control rather than something parsed out of what
 * the user types: a number saved without a country code is unusable for
 * WhatsApp delivery, and asking people to remember to type "+91" reliably
 * produces numbers that are missing it.
 *
 * The two halves are stored separately and only joined on save, so a local
 * number that starts with 0 (as most people write theirs) can be stripped in
 * one place instead of guessed at later.
 */
export function PhoneInput({
  country,
  onCountry,
  local,
  onLocal,
  error,
  label = "Mobile number",
  description,
  autoFocus,
}: {
  country: DialCode;
  onCountry: (c: DialCode) => void;
  local: string;
  onLocal: (v: string) => void;
  error?: string | null;
  label?: string;
  description?: string;
  autoFocus?: boolean;
}) {
  /**
   * Keyed by ISO rather than dial code — US and CA are both "1", and a value
   * that isn't unique leaves the Select unable to show which one is picked.
   *
   * The label is the dial code alone, because Mantine echoes it into the closed
   * input: a label carrying the country name too would truncate to "+1 U…" at
   * the width a phone field can spare, which reads as a rendering fault. The
   * name is put back in `renderOption` for the dropdown, and searching is
   * widened to cover it below.
   */
  const data = DIAL_CODES.map((c) => ({ value: c.iso, label: `+${c.dial}` }));

  const nameFor = (iso: string) => DIAL_CODES.find((c) => c.iso === iso)?.name ?? "";

  return (
    <div>
      {label && (
        <Text size="sm" fw={500} mb={2}>
          {label}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed" mb={8}>
          {description}
        </Text>
      )}
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <Select
          size="md"
          w={104}
          searchable
          allowDeselect={false}
          data={data}
          value={country.iso}
          onChange={(v) => {
            const hit = DIAL_CODES.find((c) => c.iso === v);
            if (hit) onCountry(hit);
          }}
          // The dropdown gets the country name back; the closed input keeps the
          // bare dial code from `data`.
          renderOption={({ option }) => (
            <Group gap={8} wrap="nowrap" justify="space-between" w="100%">
              <Text size="sm">{nameFor(option.value)}</Text>
              <Text size="sm" c="dimmed" fw={500}>{option.label}</Text>
            </Group>
          )}
          // Searching has to cover the name too, since it is no longer in the
          // label Mantine filters on — typing "india" would otherwise find
          // nothing unless you knew the code already.
          filter={({ options, search }) => {
            const q = search.trim().toLowerCase();
            if (!q) return options;
            return (options as { value: string; label: string }[]).filter(
              (o) =>
                nameFor(o.value).toLowerCase().includes(q) ||
                o.label.replace("+", "").startsWith(q.replace("+", ""))
            );
          }}
          styles={{ input: { fontWeight: 500 } }}
          comboboxProps={{ width: 280, position: "bottom-start" }}
          aria-label="Country code"
        />
        <TextInput
          size="md"
          style={{ flex: 1 }}
          placeholder="98765 43210"
          inputMode="tel"
          autoComplete="tel-national"
          value={local}
          error={error}
          // Digits and spaces only: everything else is punctuation people add
          // out of habit, and stripping it here means the value is already
          // clean by the time it is saved.
          onChange={(e) => onLocal(e.currentTarget.value.replace(/[^\d\s]/g, ""))}
          data-autofocus={autoFocus || undefined}
        />
      </Group>
    </div>
  );
}

/** Digits only, country code first — the shape the API and WhatsApp both want. */
export function joinNumber(country: DialCode, local: string): string {
  // A leading 0 is a domestic trunk prefix, not part of the number: "098765..."
  // dialled internationally is wrong, and users type it constantly.
  const digits = local.replace(/[^\d]/g, "").replace(/^0+/, "");
  return `${country.dial}${digits}`;
}

/** Length is checked, not format — numbering plans vary too much to validate properly. */
export function localNumberError(local: string): string | null {
  const digits = local.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (!digits) return "Enter your mobile number";
  if (digits.length < 6) return "That number looks too short";
  if (digits.length > 15) return "That number looks too long";
  return null;
}
