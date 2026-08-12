import {
  Box, Stack, Text, TextInput, Textarea, Select, Radio, Checkbox, NumberInput,
  Group, ActionIcon, Tooltip, Button, Center, ThemeIcon,
} from "@mantine/core";
import { ChevronUp, ChevronDown, Settings2, LayoutList } from "lucide-react";
import { packRows, type FormField } from "@/features/forms/lib/types";

/**
 * The centre canvas: the form as the visitor will see it, editable in place.
 *
 * Rendered with the real inputs rather than placeholder boxes, and deliberately
 * disabled — the person building it needs to see the actual control widths and
 * label lengths, but typing an answer into your own draft does nothing useful
 * and looks broken when it fails to save.
 *
 * The row packing is shared with the hosted page via `packRows`, so the builder
 * cannot lay a form out differently from how it will actually render.
 */
export function FormCanvas({
  title,
  fields,
  selectedKey,
  submitText,
  onSelect,
  onMove,
  readOnly = false,
}: {
  title: string;
  fields: FormField[];
  selectedKey: string | null;
  submitText: string;
  onSelect: (key: string) => void;
  onMove: (key: string, direction: -1 | 1) => void;
  /** True for the preview tab: no selection, no reordering, just the form. */
  readOnly?: boolean;
}) {
  // Hidden fields are retired — the visitor never sees them, so neither does
  // the canvas. Their answers still exist, which is why they are filtered here
  // rather than deleted from the form.
  const visible = fields.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
  const rows = packRows(visible);

  return (
    <Box className="surface-card" p="xl" maw={760} mx="auto" w="100%">
      <Text fw={700} size="xl" ta="center" mb="xl">
        {title || "Untitled form"}
      </Text>

      {!visible.length ? (
        <Center py={56}>
          <Stack align="center" gap={6}>
            <ThemeIcon size={48} radius="xl" variant="light" color="emerald">
              <LayoutList size={22} />
            </ThemeIcon>
            <Text fw={600}>No fields yet</Text>
            <Text size="sm" c="dimmed" ta="center" maw={320}>
              Pick a field type from the left to start building. Click any field once it is
              here to change its label, width, or whether it is required.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {rows.map((row, rowIndex) => (
            <Group key={rowIndex} gap="md" align="flex-start" wrap="nowrap">
              {row.map((field) => (
                <Box
                  key={field.key}
                  // The twelfths translate straight to a flex basis, so a "third"
                  // is a third of the row whatever else shares it.
                  style={{
                    flex: `0 0 calc(${((field.type === "textarea" ? 12 : field.width) / 12) * 100}% - ${
                      row.length > 1 ? "8px" : "0px"
                    })`,
                    minWidth: 0,
                  }}
                >
                  <FieldPreview
                    field={field}
                    selected={!readOnly && selectedKey === field.key}
                    readOnly={readOnly}
                    onSelect={() => onSelect(field.key)}
                    onMoveUp={() => onMove(field.key, -1)}
                    onMoveDown={() => onMove(field.key, 1)}
                    isFirst={visible[0]?.key === field.key}
                    isLast={visible[visible.length - 1]?.key === field.key}
                  />
                </Box>
              ))}
            </Group>
          ))}

          <Button mt="md" disabled fullWidth={false} style={{ alignSelf: "flex-start" }}>
            {submitText || "Submit"}
          </Button>
        </Stack>
      )}
    </Box>
  );
}

/** One field, rendered as its real input and wrapped in the builder's selection chrome. */
function FieldPreview({
  field,
  selected,
  readOnly,
  onSelect,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: FormField;
  selected: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const label = (
    <Group gap={4} wrap="nowrap">
      <Text size="sm" fw={550}>{field.label}</Text>
      {field.required && <Text size="sm" c="red">*</Text>}
    </Group>
  );

  // Every control is disabled: this is a picture of the form, not the form.
  const common = {
    disabled: true,
    placeholder: field.placeholder,
    description: field.help || undefined,
  };

  const input = (() => {
    switch (field.type) {
      case "textarea":
        return <Textarea {...common} autosize minRows={3} />;
      case "select":
        return <Select {...common} data={field.options} />;
      case "number":
        return <NumberInput {...common} />;
      case "checkbox":
        return <Checkbox disabled label={field.label} description={field.help || undefined} />;
      case "radio":
        return (
          <Radio.Group description={field.help || undefined}>
            <Stack gap={6} mt={6}>
              {field.options.map((o) => (
                <Radio key={o} value={o} label={o} disabled />
              ))}
            </Stack>
          </Radio.Group>
        );
      default:
        return <TextInput {...common} type={field.type === "email" ? "email" : "text"} />;
    }
  })();

  if (readOnly) {
    return (
      <Stack gap={4}>
        {field.type !== "checkbox" && label}
        {input}
      </Stack>
    );
  }

  return (
    <Box
      onClick={onSelect}
      p="sm"
      style={{
        cursor: "pointer",
        borderRadius: 8,
        border: `1px ${selected ? "solid" : "dashed"} var(--mantine-color-${selected ? "emerald-5" : "default-border"})`,
        background: selected ? "var(--mantine-color-emerald-light)" : undefined,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
        {field.type !== "checkbox" ? label : <Box />}
        <Group gap={2} wrap="nowrap">
          {/* Up/down rather than drag-and-drop. It reorders exactly as well and
              costs a fraction of the work; dragging can come once the rest ships. */}
          <Tooltip label="Move up" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              disabled={isFirst}
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            >
              <ChevronUp size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Move down" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              disabled={isLast}
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            >
              <ChevronDown size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Properties" withArrow>
            <ActionIcon size="sm" variant="subtle" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
              <Settings2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      {input}
    </Box>
  );
}
