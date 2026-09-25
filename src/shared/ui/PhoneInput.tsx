import { useState } from "react";
import {
  Combobox, Group, Text, TextInput, UnstyledButton, useCombobox,
} from "@mantine/core";
import { ChevronDown, Search } from "lucide-react";
import { DIAL_CODES, type DialCode } from "@/shared/lib/dialCodes";


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
 
  const nameFor = (iso: string) => DIAL_CODES.find((c) => c.iso === iso)?.name ?? "";

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState("");

  const results = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return DIAL_CODES;
    return DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        `${c.dial}`.startsWith(q.replace("+", ""))
    );
  })();

  return (
    <div>
      {/* Mantine's own label/description classes, so this reads exactly like
          the TextInputs around it, whatever styles the page gives those. */}
      {label && (
        <Text component="div" size="sm" fw={500} className="mantine-InputWrapper-label">
          {label}
        </Text>
      )}
      {description && (
        <Text size="xs" c="dimmed" mb={6} className="mantine-InputWrapper-description">
          {description}
        </Text>
      )}
      {/* One field: the country code sits inside it, behind a divider, so
          the pair reads as a single phone number rather than two controls. */}
      <TextInput
        placeholder="98765 43210"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        error={error}
        onChange={(e) => onLocal(e.currentTarget.value.replace(/[^\d\s]/g, ""))}
        data-autofocus={autoFocus || undefined}
        leftSectionWidth={78}
        leftSectionPointerEvents="all"
        leftSection={
          <Combobox
            store={combobox}
            width={280}
            position="bottom-start"
            onOptionSubmit={(iso) => {
              const hit = DIAL_CODES.find((c) => c.iso === iso);
              if (hit) onCountry(hit);
              setSearch("");
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target>
              <UnstyledButton
                onClick={() => combobox.toggleDropdown()}
                aria-label={`Country code: +${country.dial}`}
                style={{
                  alignSelf: "stretch",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                  padding: "0 10px 0 12px",
                  borderRight: "1px solid var(--mantine-color-default-border)",
                  fontSize: "var(--mantine-font-size-sm)",
                  fontWeight: 500,
                  color: "var(--mantine-color-text)",
                }}
              >
                +{country.dial}
                <ChevronDown size={13} style={{ color: "var(--muted)", flexShrink: 0 }} />
              </UnstyledButton>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Search
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Search country"
                leftSection={<Search size={14} style={{ color: "var(--muted)" }} />}
              />
              <Combobox.Options mah={260} style={{ overflowY: "auto" }}>
                {results.length === 0 ? (
                  <Combobox.Empty>No matches</Combobox.Empty>
                ) : (
                  results.map((c) => (
                    <Combobox.Option value={c.iso} key={c.iso} active={c.iso === country.iso}>
                      <Group gap={8} wrap="nowrap" justify="space-between" w="100%">
                        <Text size="sm">{nameFor(c.iso)}</Text>
                        <Text size="sm" c="dimmed" fw={500}>+{c.dial}</Text>
                      </Group>
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        }
        styles={{ section: { alignItems: "stretch" }, input: { paddingLeft: 90 } }}
      />
    </div>
  );
}

export function joinNumber(country: DialCode, local: string): string {
  const digits = local.replace(/[^\d]/g, "").replace(/^0+/, "");
  return `${country.dial}${digits}`;
}

export function localNumberError(local: string): string | null {
  const digits = local.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (!digits) return "Enter your mobile number";
  if (digits.length < 6) return "That number looks too short";
  if (digits.length > 15) return "That number looks too long";
  return null;
}
