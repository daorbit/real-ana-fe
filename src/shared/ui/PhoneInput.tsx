import { useState } from "react";
import {
  Combobox, Text, TextInput, UnstyledButton, useCombobox,
} from "@mantine/core";
import { Check, ChevronDown, Search } from "lucide-react";
import { DIAL_CODES, type DialCode } from "@/shared/lib/dialCodes";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import classes from "./PhoneInput.module.css";


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
        leftSectionWidth={100}
        leftSectionPointerEvents="all"
        leftSection={
          <Combobox
            store={combobox}
            width={300}
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
                className={classes.trigger}
                data-open={combobox.dropdownOpened || undefined}
                onClick={() => combobox.toggleDropdown()}
                aria-label={`Country code: ${nameFor(country.iso)} +${country.dial}`}
              >
                <CountryFlag code={country.iso} size={14} />
                <span className={classes.triggerCode}>+{country.dial}</span>
                <ChevronDown size={13} className={classes.chevron} />
              </UnstyledButton>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Search
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Search country or code"
                leftSection={<Search size={14} className={classes.searchIcon} />}
              />
              <Combobox.Options className={classes.options}>
                {results.length === 0 ? (
                  <Combobox.Empty>No matches</Combobox.Empty>
                ) : (
                  results.map((c) => {
                    const selected = c.iso === country.iso;
                    return (
                      <Combobox.Option
                        value={c.iso}
                        key={c.iso}
                        active={selected}
                        className={classes.option}
                      >
                        <CountryFlag code={c.iso} size={15} />
                        <span className={classes.optionName}>{nameFor(c.iso)}</span>
                        <span className={classes.optionDial}>+{c.dial}</span>
                        <span className={classes.check}>{selected && <Check size={14} />}</span>
                      </Combobox.Option>
                    );
                  })
                )}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        }
        classNames={{ section: classes.section, input: classes.input }}
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
