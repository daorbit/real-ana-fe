import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card, Group, Stack, Button, TextInput, Textarea,
  ActionIcon, Center, Loader, Badge, Tabs, Alert, Divider, ColorInput,
  TagsInput, Box, Drawer,
} from "@mantine/core";
import {
  DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  ArrowLeft, Plus, TriangleAlert, Send, Ban, Palette, LayoutGrid,
} from "lucide-react";
import {
  useGetFormQuery, useUpdateFormMutation, usePublishFormMutation,
  useCloseFormMutation, useGetFormSubmissionsQuery,
} from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import { ShareCard } from "@/features/forms/components/ShareCard";
import { FieldPalette, PALETTE_DRAG_PREFIX } from "@/features/forms/builder/FieldPalette";
import { SortableFieldCard, FieldDragPreview, PaletteDragPreview, FIELD_TYPES } from "@/features/forms/builder/SortableFieldCard";
import { PageBreakDivider } from "@/features/forms/builder/PageBreakDivider";
import { ThemeGallery } from "@/features/forms/builder/ThemeGallery";
import { DeviceFramePreview } from "@/features/forms/builder/DeviceFramePreview";
import type { FormField, FormFieldType, FormSettings } from "@/shared/types";

function keyFromLabel(label: string, existing: Set<string>): string {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  let key = base;
  let n = 1;
  while (existing.has(key)) key = `${base}_${++n}`;
  return key;
}

function newField(type: FormFieldType, order: number, existing: Set<string>): FormField {
  const label = "New field";
  return {
    key: keyFromLabel(label, existing),
    label,
    type,
    required: false,
    maxLength: 200,
    order,
  };
}

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: form, isLoading } = useGetFormQuery({ id: id! }, { skip: !id });
  const { data: subsPage } = useGetFormSubmissionsQuery({ id: id!, limit: 1 }, { skip: !id });

  const [update, { isLoading: saving }] = useUpdateFormMutation();
  const [publish, { isLoading: publishing }] = usePublishFormMutation();
  const [close, { isLoading: closing }] = useCloseFormMutation();

  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState(false);
  const [themeGalleryOpen, setThemeGalleryOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!form) return;
    setName(form.name);
    setFields(form.fields);
    setSettings(form.settings);
  }, [form]);

  const hasSubmissions = (subsPage?.total ?? 0) > 0;

  if (isLoading || !form || !settings) {
    return <Center py="xl"><Loader size="sm" /></Center>;
  }

  const originalKeys = new Set(form.fields.map((f) => f.key));

  const addField = (type: FormFieldType = "text") => {
    const existing = new Set(fields.map((f) => f.key));
    setFields([...fields, newField(type, fields.length, existing)]);
  };

  const insertField = (type: FormFieldType, index: number) => {
    const existing = new Set(fields.map((f) => f.key));
    const next = [...fields];
    next.splice(index, 0, newField(type, 0, existing));
    setFields(next.map((f, i) => ({ ...f, order: i })));
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeField = (index: number) => {
    const field = fields[index];
    if (hasSubmissions && originalKeys.has(field.key)) {
      setPendingRemoval(true);
    }
    setFields((prev) => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
  };

  const togglePageBreak = (index: number) => {
    updateField(index, { pageBreakAfter: !fields[index].pageBreakAfter });
  };

  const onDragStart = (e: DragStartEvent) => setActiveDrag(String(e.active.id));

  const onDragOver = (e: { over: { id: string | number } | null }) => {
    setOverId(e.over ? String(e.over.id) : null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    setOverId(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    if (activeId.startsWith(PALETTE_DRAG_PREFIX)) {
      const type = activeId.slice(PALETTE_DRAG_PREFIX.length) as FormFieldType;
      const overIdStr = String(over.id);
      const overIndex = fields.findIndex((f) => f.key === overIdStr);
      insertField(type, overIndex === -1 ? fields.length : overIndex);
      return;
    }

    if (active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.key === active.id);
    const newIndex = fields.findIndex((f) => f.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setFields(arrayMove(fields, oldIndex, newIndex).map((f, i) => ({ ...f, order: i })));
  };

  const draggingField = activeDrag && !activeDrag.startsWith(PALETTE_DRAG_PREFIX)
    ? fields.find((f) => f.key === activeDrag)
    : null;
  const draggingPaletteType = activeDrag?.startsWith(PALETTE_DRAG_PREFIX)
    ? activeDrag.slice(PALETTE_DRAG_PREFIX.length)
    : null;
  const draggingPaletteLabel = FIELD_TYPES.find((t) => t.value === draggingPaletteType)?.label ?? "";

  const save = async () => {
    try {
      await update({
        id: form.id,
        name,
        fields: fields.map((f, i) => ({ ...f, order: i })),
        settings,
      }).unwrap();
      notify.success("Form saved.", "Forms");
      setPendingRemoval(false);
    } catch (e) {
      notifyError(e, "Could not save the form — check that no field with existing submissions was removed or renamed.");
    }
  };

  const doPublish = async () => {
    try {
      await publish({ id: form.id }).unwrap();
      notify.success("Form published.", "Forms");
    } catch (e) {
      notifyError(e, "Could not publish the form.");
    }
  };

  const doClose = async () => {
    try {
      await close({ id: form.id }).unwrap();
      notify.success("Form closed.", "Forms");
    } catch (e) {
      notifyError(e, "Could not close the form.");
    }
  };

  return (
    <Stack gap="lg" p="lg">
      <Group justify="space-between" wrap="wrap">
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate("/app/forms")}>
            <ArrowLeft size={16} />
          </ActionIcon>
          <TextInput
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            variant="unstyled"
            fw={700}
            style={{ fontSize: 18 }}
          />
          <Badge size="sm" variant="light" color={form.status === "published" ? "emerald" : form.status === "closed" ? "red" : "gray"}>
            {form.status}
          </Badge>
        </Group>
        <Group gap="sm">
          <Button component={Link} to={`/app/forms/${form.id}/submissions`} variant="default">
            Submissions
          </Button>
          {form.status !== "published" && (
            <Button leftSection={<Send size={15} />} onClick={doPublish} loading={publishing}>
              Publish
            </Button>
          )}
          {form.status === "published" && (
            <Button leftSection={<Ban size={15} />} color="red" variant="light" onClick={doClose} loading={closing}>
              Close
            </Button>
          )}
          <Button onClick={save} loading={saving}>Save</Button>
        </Group>
      </Group>

      {hasSubmissions && (
        <Alert color="orange" variant="light" icon={<TriangleAlert size={16} />} title="This form has submissions">
          Removing or renaming a field that already has data leaves old submissions with their original
          column — data is never silently dropped, but the server will reject a save that reuses a locked
          field's key for something else.
        </Alert>
      )}
      {pendingRemoval && (
        <Alert color="red" variant="light" icon={<TriangleAlert size={16} />} title="Field removed">
          You removed a field that has existing submissions. Saving will hide it from the live form, but
          past answers are kept under their original key.
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => { setActiveDrag(null); setOverId(null); }}
      >
        <Box
          className="form-builder-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "280px minmax(420px, 1fr) minmax(380px, 420px)",
            gap: "var(--mantine-spacing-lg)",
            alignItems: "start",
          }}
        >
          <Box className="form-builder-palette-col" visibleFrom="lg">
            <FieldPalette />
          </Box>

          <div style={{ minWidth: 0 }}>
            <Tabs defaultValue="fields">
              <Tabs.List mb="md">
                <Tabs.Tab value="fields">Fields</Tabs.Tab>
                <Tabs.Tab value="settings">Settings</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="fields">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Button
                      hiddenFrom="lg"
                      variant="default"
                      leftSection={<LayoutGrid size={15} />}
                      onClick={() => setPaletteDrawerOpen(true)}
                    >
                      Add field
                    </Button>
                    <div style={{ flex: 1 }} />
                    <Button
                      variant="light"
                      leftSection={<Palette size={15} />}
                      onClick={() => setThemeGalleryOpen(true)}
                    >
                      Theme
                    </Button>
                  </Group>

                  <SortableContext items={fields.map((f) => f.key)} strategy={verticalListSortingStrategy}>
                    {fields.map((field, i) => {
                      const locked = hasSubmissions && originalKeys.has(field.key);
                      return (
                        <div key={field.key}>
                          {overId === field.key && draggingField?.key !== field.key && (
                            <div className="field-drop-indicator" />
                          )}
                          <SortableFieldCard
                            field={field}
                            locked={locked}
                            onUpdate={(patch) => updateField(i, patch)}
                            onRemove={() => removeField(i)}
                          />
                          <PageBreakDivider
                            active={Boolean(field.pageBreakAfter)}
                            onToggle={() => togglePageBreak(i)}
                          />
                        </div>
                      );
                    })}
                  </SortableContext>

                  <Button variant="default" leftSection={<Plus size={15} />} onClick={() => addField()}>
                    Add field
                  </Button>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="settings">
                <Card withBorder radius="md" padding="md">
                  <Stack gap="md">
                    <TextInput
                      label="Submit button text"
                      value={settings.submitText}
                      onChange={(e) => setSettings({ ...settings, submitText: e.currentTarget.value })}
                    />
                    <Textarea
                      label="Success message"
                      value={settings.successMessage}
                      onChange={(e) => setSettings({ ...settings, successMessage: e.currentTarget.value })}
                      autosize
                      minRows={2}
                    />
                    <TextInput
                      label="Redirect URL"
                      description="Overrides the success message when set"
                      value={settings.redirectUrl ?? ""}
                      onChange={(e) => setSettings({ ...settings, redirectUrl: e.currentTarget.value || undefined })}
                    />
                    <TagsInput
                      label="Notify emails"
                      value={settings.notifyEmails}
                      onChange={(notifyEmails) => setSettings({ ...settings, notifyEmails })}
                    />
                    <ColorInput
                      label="Primary color"
                      value={settings.primaryColor ?? ""}
                      onChange={(primaryColor) => setSettings({ ...settings, primaryColor })}
                    />
                    <TextInput
                      label="Logo URL"
                      value={settings.logoUrl ?? ""}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.currentTarget.value || undefined })}
                    />
                    <Divider />
                    <Textarea
                      label="Closed message"
                      description="Shown once the form is closed"
                      value={settings.closedMessage}
                      onChange={(e) => setSettings({ ...settings, closedMessage: e.currentTarget.value })}
                      autosize
                      minRows={2}
                    />
                  </Stack>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>

          <div style={{ minWidth: 0 }}>
            <Stack gap="lg">
              <DeviceFramePreview name={name} fields={fields} settings={settings} />
              <ShareCard form={form} />
            </Stack>
          </div>
        </Box>

        <DragOverlay dropAnimation={null}>
          {draggingField ? (
            <FieldDragPreview field={draggingField} />
          ) : draggingPaletteType ? (
            <PaletteDragPreview label={draggingPaletteLabel} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Drawer
        opened={paletteDrawerOpen}
        onClose={() => setPaletteDrawerOpen(false)}
        title="Add a field"
        position="left"
        size="xs"
      >
        <FieldPalette />
      </Drawer>

      <ThemeGallery
        opened={themeGalleryOpen}
        onClose={() => setThemeGalleryOpen(false)}
        value={settings.theme ?? "default"}
        onSelect={(theme) => setSettings({ ...settings, theme })}
      />
    </Stack>
  );
}
