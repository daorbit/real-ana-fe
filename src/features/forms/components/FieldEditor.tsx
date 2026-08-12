import {
  Drawer, Stack, TextInput, Textarea, Switch, SegmentedControl, Text, Button,
  Group, ActionIcon, Divider, NumberInput, Alert,
} from "@mantine/core";
import { Plus, Trash2, Lock } from "lucide-react";
import { CHOICE_TYPES, type FormField, type FieldWidth } from "@/features/forms/lib/types";

/**
 * The field property panel, opened by selecting a field on the canvas.
 *
 * A drawer rather than an inline expansion, for the same reason Zoho uses one:
 * a field has a dozen properties, and unfolding them in place shoves the rest
 * of the form off screen — losing the context the person is editing against.
 *
 * The key is shown and never editable. Once answers exist under it the server
 * refuses to change it, and offering an input that would be rejected is worse
 * than showing the constraint.
 */
export function FieldEditor({
  field,
  locked,
  onChange,
  onClose,
  onRemove,
}: {
  field: FormField | null;
  /** True once the form has submissions: type and key are frozen, removal hides. */
  locked: boolean;
  onChange: (next: FormField) => void;
  onClose: () => void;
  onRemove: () => void;
}) {
  if (!field) return null;

  const set = <K extends keyof FormField>(key: K, value: FormField[K]) =>
    onChange({ ...field, [key]: value });

  const isChoice = CHOICE_TYPES.includes(field.type);

  return (
    <Drawer
      opened={Boolean(field)}
      onClose={onClose}
      position="right"
      size={380}
      title={<Text fw={650}>Field properties</Text>}
      overlayProps={{ backgroundOpacity: 0.35, blur: 1 }}
    >
      <Stack gap="md">
        <TextInput
          label="Field label"
          value={field.label}
          onChange={(e) => set("label", e.currentTarget.value)}
          required
        />

        <Textarea
          label="Instructions"
          description="Shown under the input, for anything the label cannot say in three words."
          value={field.help}
          onChange={(e) => set("help", e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <TextInput
          label="Placeholder"
          value={field.placeholder}
          onChange={(e) => set("placeholder", e.currentTarget.value)}
        />

        <div>
          <Text size="sm" fw={500} mb={6}>Field width</Text>
          <SegmentedControl
            fullWidth
            // A textarea in a third of a row is unusable, so it is full width
            // whatever is chosen here — the server enforces the same floor.
            disabled={field.type === "textarea"}
            value={String(field.type === "textarea" ? 12 : field.width)}
            onChange={(v) => set("width", Number(v) as FieldWidth)}
            data={[
              { label: "Third", value: "4" },
              { label: "Half", value: "6" },
              { label: "Full", value: "12" },
            ]}
          />
          <Text size="xs" c="dimmed" mt={6}>
            Fields sit side by side until a row is full, then wrap to the next one.
          </Text>
        </div>

        <Switch
          label="Required"
          description="The form cannot be submitted without an answer."
          checked={field.required}
          onChange={(e) => set("required", e.currentTarget.checked)}
        />

        {field.type !== "checkbox" && (
          <NumberInput
            label="Maximum length"
            description="Characters. Answers longer than this are trimmed."
            value={field.maxLength}
            onChange={(v) => set("maxLength", Number(v) || 1)}
            min={1}
            max={5000}
          />
        )}

        {isChoice && (
          <>
            <Divider label="Choices" labelPosition="left" />
            <Stack gap={6}>
              {field.options.map((option, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <TextInput
                    flex={1}
                    value={option}
                    onChange={(e) => {
                      const options = [...field.options];
                      options[i] = e.currentTarget.value;
                      set("options", options);
                    }}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    // A choice field with no options cannot be answered, and the
                    // server refuses to save one — so the last option stays.
                    disabled={field.options.length <= 1}
                    onClick={() => set("options", field.options.filter((_, n) => n !== i))}
                  >
                    <Trash2 size={15} />
                  </ActionIcon>
                </Group>
              ))}
              <Button
                variant="subtle"
                size="xs"
                leftSection={<Plus size={14} />}
                onClick={() => set("options", [...field.options, `Choice ${field.options.length + 1}`])}
              >
                Add choice
              </Button>
            </Stack>
          </>
        )}

        <Divider />

        <Alert variant="light" color="gray" icon={<Lock size={15} />} p="xs">
          <Text size="xs">
            Stored as <Text span ff="monospace" fw={600}>{field.key}</Text>
            {locked
              ? " — fixed, because this form already has responses saved under it."
              : " — set from the label when the field was added."}
          </Text>
        </Alert>

        {locked && (
          <Text size="xs" c="dimmed">
            Removing this field hides it from the form. Responses already collected keep their
            column, so nothing you have gathered disappears.
          </Text>
        )}

        <Button
          variant="light"
          color="red"
          leftSection={<Trash2 size={15} />}
          onClick={onRemove}
        >
          {locked ? "Hide this field" : "Remove this field"}
        </Button>
      </Stack>
    </Drawer>
  );
}
