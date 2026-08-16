import { useDraggable } from "@dnd-kit/core";
import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  Type, Mail, Phone, ChevronDown, CircleDot, SquareCheck, Hash, AlignLeft,
} from "lucide-react";
import type { FormFieldType } from "@/shared/types";

export const PALETTE_DRAG_PREFIX = "palette:";

type PaletteItem = { value: FormFieldType; label: string; icon: typeof Type };

// Same 8 field types FormBuilderPage already offers, grouped for scannability
// — not the Zoho screenshot's full type list (currency/signature/file etc).
const GROUPS: { title: string; items: PaletteItem[] }[] = [
  {
    title: "Basic info",
    items: [
      { value: "text", label: "Text", icon: Type },
      { value: "email", label: "Email", icon: Mail },
      { value: "tel", label: "Phone", icon: Phone },
    ],
  },
  {
    title: "Choices",
    items: [
      { value: "select", label: "Dropdown", icon: ChevronDown },
      { value: "radio", label: "Radio", icon: CircleDot },
      { value: "checkbox", label: "Checkbox", icon: SquareCheck },
    ],
  },
  {
    title: "Number",
    items: [{ value: "number", label: "Number", icon: Hash }],
  },
  {
    title: "Long text",
    items: [{ value: "textarea", label: "Long text", icon: AlignLeft }],
  },
];

function PaletteButton({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${PALETTE_DRAG_PREFIX}${item.value}`,
    data: { type: item.value },
  });
  const Icon = item.icon;

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      withBorder
      radius="md"
      padding="sm"
      className="field-palette-item"
      style={{ opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
    >
      <Stack gap={6} align="center">
        <Icon size={18} />
        <Text size="xs" fw={500} ta="center">{item.label}</Text>
      </Stack>
    </Card>
  );
}

export function FieldPalette() {
  return (
    <Card withBorder radius="md" padding="md">
      <Text fw={600} size="sm" mb="md">Add a field</Text>
      <Stack gap="lg">
        {GROUPS.map((group) => (
          <Stack key={group.title} gap={8}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">{group.title}</Text>
            <SimpleGrid cols={group.items.length === 1 ? 1 : 3} spacing={8}>
              {group.items.map((item) => (
                <PaletteButton key={item.value} item={item} />
              ))}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
