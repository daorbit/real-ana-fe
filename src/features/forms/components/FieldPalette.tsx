import { useState } from "react";
import { Stack, TextInput, Text, UnstyledButton, SimpleGrid, ScrollArea, ThemeIcon } from "@mantine/core";
import {
  Search, Type, AlignLeft, Mail, Phone, Hash, ChevronDown, CircleDot, CheckSquare,
} from "lucide-react";
import { FIELD_PALETTE, PALETTE_GROUPS, type PaletteEntry, type FieldType } from "@/features/forms/lib/types";

/** One icon per field type, so the rail is scannable by shape rather than read word by word. */
const ICONS: Record<FieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  email: Mail,
  tel: Phone,
  number: Hash,
  select: ChevronDown,
  radio: CircleDot,
  checkbox: CheckSquare,
};

/**
 * The left rail of field types.
 *
 * Click to append, not drag to place. Dragging is the single largest chunk of
 * work in the builder and it is not what makes the form useful — a click that
 * adds to the end, plus reordering on the canvas, covers the same ground and
 * ships first.
 *
 * Grouped and searchable because eight types fit on screen but the list grows,
 * and a search box that was not there from the start is a search box nobody
 * looks for later.
 */
export function FieldPalette({ onAdd }: { onAdd: (entry: PaletteEntry) => void }) {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const matches = (entry: PaletteEntry) =>
    !term || entry.label.toLowerCase().includes(term) || entry.type.includes(term);

  const groups = PALETTE_GROUPS.map((group) => ({
    group,
    entries: FIELD_PALETTE.filter((e) => e.group === group && matches(e)),
  })).filter((g) => g.entries.length);

  return (
    <Stack gap="sm" h="100%">
      <TextInput
        placeholder="Search fields"
        leftSection={<Search size={15} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
      />

      <ScrollArea flex={1} type="hover" offsetScrollbars>
        <Stack gap="lg" pb="md">
          {groups.map(({ group, entries }) => (
            <Stack key={group} gap={8}>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 0.4 }}>
                {group}
              </Text>
              <SimpleGrid cols={2} spacing={8}>
                {entries.map((entry) => {
                  const Icon = ICONS[entry.type];
                  return (
                    <UnstyledButton
                      key={entry.type}
                      onClick={() => onAdd(entry)}
                      className="surface-card"
                      p="xs"
                      style={{ textAlign: "center", borderRadius: 8 }}
                    >
                      <Stack gap={4} align="center">
                        <ThemeIcon size={28} radius="md" variant="light" color="emerald">
                          <Icon size={15} />
                        </ThemeIcon>
                        <Text size="xs" fw={550} lh={1.2}>{entry.label}</Text>
                      </Stack>
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}

          {!groups.length && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No field type matches “{query}”.
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
