import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon, Badge, Card, Group, Select, Switch, TagsInput, TextInput, Tooltip,
} from "@mantine/core";
import { GripVertical, Trash2 } from "lucide-react";
import type { FormField, FormFieldType } from "@/shared/types";

export const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio buttons" },
  { value: "number", label: "Number" },
];

export const HAS_OPTIONS: FormFieldType[] = ["select", "radio"];

export function SortableFieldCard({
  field, locked, onUpdate, onRemove,
}: {
  field: FormField;
  locked: boolean;
  onUpdate: (patch: Partial<FormField>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.key,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "field-card is-dragging" : "field-card"}>
      <Card withBorder radius="md" padding="md">
        <Group justify="space-between" mb="sm" wrap="nowrap">
          <Group gap={6}>
            <Tooltip label="Drag to reorder" withArrow>
              <ActionIcon variant="subtle" size="sm" style={{ cursor: "grab" }} {...attributes} {...listeners}>
                <GripVertical size={14} />
              </ActionIcon>
            </Tooltip>
            {locked && <Badge size="xs" variant="light" color="orange">has data</Badge>}
          </Group>
          <Tooltip label="Remove field" withArrow>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
              <Trash2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput
            label="Label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.currentTarget.value })}
            style={{ flex: 1, minWidth: 140 }}
          />
          <Select
            label="Type"
            data={FIELD_TYPES}
            value={field.type}
            onChange={(v) => v && onUpdate({ type: v as FormFieldType })}
            disabled={locked}
            style={{ width: 150 }}
          />
          <Switch
            label="Required"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.currentTarget.checked })}
            mb={8}
          />
        </Group>

        {HAS_OPTIONS.includes(field.type) && (
          <TagsInput
            mt="sm"
            label="Options"
            placeholder="Type an option and press Enter"
            value={field.options ?? []}
            onChange={(options) => onUpdate({ options })}
          />
        )}
      </Card>
    </div>
  );
}

/** The compact card that follows the cursor while a field is being dragged
 *  — same pattern as `SortableWidget.tsx`'s `WidgetDragPreview`. */
export function FieldDragPreview({ field }: { field: FormField }) {
  return (
    <Card withBorder radius="md" padding="sm" className="sw-overlay">
      <Group gap={8} wrap="nowrap">
        <GripVertical size={16} />
        <TextInput value={field.label} readOnly variant="unstyled" size="sm" style={{ flex: 1 }} />
      </Group>
    </Card>
  );
}

/** A palette item being dragged onto the canvas. */
export function PaletteDragPreview({ label }: { label: string }) {
  return (
    <Card withBorder radius="md" padding="sm" className="sw-overlay">
      <Group gap={8} wrap="nowrap">
        <GripVertical size={16} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      </Group>
    </Card>
  );
}
