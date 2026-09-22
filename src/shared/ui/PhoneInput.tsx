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
              className="mantine-Input-input"
              onClick={() => combobox.toggleDropdown()}
              aria-label="Country code"
              style={{
                width: 84,
                height: "var(--input-height, 2.625rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                fontWeight: 500,
                borderRadius: "var(--mantine-radius-default)",
              }}
            >
              +{country.dial}
              <ChevronDown size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
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
        <TextInput
          size="md"
          style={{ flex: 1 }}
          placeholder="98765 43210"
          inputMode="tel"
          autoComplete="tel-national"
          value={local}
          error={error}
          onChange={(e) => onLocal(e.currentTarget.value.replace(/[^\d\s]/g, ""))}
          data-autofocus={autoFocus || undefined}
        />
      </Group>
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
