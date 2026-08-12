import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box, Group, Button, Text, Loader, Center, Tabs, Badge, TextInput, Alert, ScrollArea,
} from "@mantine/core";
import { ArrowLeft, Eye, Save, Share2, Send, PauseCircle, Info, Settings } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useGetFormQuery, useSetFormStatusMutation } from "@/app/store";
import { useActiveBilling, usePermissions } from "@/features/workspace/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { FieldPalette } from "@/features/forms/components/FieldPalette";
import { FormCanvas } from "@/features/forms/components/FormCanvas";
import { FieldEditor } from "@/features/forms/components/FieldEditor";
import { SettingsPanel } from "@/features/forms/components/SettingsPanel";
import { ShareCard } from "@/features/forms/components/ShareCard";
import { useFormBuilder } from "@/features/forms/lib/useFormBuilder";

/**
 * The builder.
 *
 * Three panes: field types on the left, the form itself in the middle, and a
 * property drawer that slides in over the right when a field is selected. The
 * middle pane is the actual form rather than an abstract list of rows, because
 * the questions being answered here — is that label too long, do those two
 * fields belong side by side — can only be answered by looking at it.
 *
 * Settings and sharing are tabs rather than a fourth pane. They are read once
 * when the form is set up and rarely again, and giving them permanent screen
 * space would take it from the part being worked on continuously.
 */
export default function FormBuilderPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const billing = useActiveBilling();
  const { canEdit } = usePermissions();

  const { data: form, isLoading } = useGetFormQuery(id, { skip: !id });
  const [setStatus, { isLoading: publishing }] = useSetFormStatusMutation();
  const builder = useFormBuilder(form);
  const [tab, setTab] = useState<string>("build");

  if (isLoading || !form || !builder.settings) {
    return (
      <AppShell>
        <Center py={80}><Loader size="sm" /></Center>
      </AppShell>
    );
  }

  const liveFields = builder.fields.filter((f) => !f.hidden);

  const publish = async () => {
    // Saved first: publishing an unsaved draft would put the last *saved*
    // version live, which is not what the button appears to promise.
    if (builder.dirty) {
      const ok = await builder.persist();
      if (!ok) return;
    }
    try {
      await setStatus({ id: form.id, action: form.status === "draft" ? "publish" : "reopen" }).unwrap();
      notify.success("Your form is live", "Published");
      setTab("share");
    } catch (e) {
      notify.error(errMessage(e, "Could not publish this form"));
    }
  };

  const close = async () => {
    try {
      await setStatus({ id: form.id, action: "close" }).unwrap();
      notify.success("Form closed to new responses");
    } catch (e) {
      notify.error(errMessage(e, "Could not close this form"));
    }
  };

  return (
    <AppShell>
      <Box px="md" py="sm">
        {/* Toolbar. Deliberately its own row above the panes: the name, the
            status, and Save are the three things needed from anywhere in the
            builder, so they must not scroll away with a pane. */}
        <Group justify="space-between" wrap="nowrap" mb="md">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<ArrowLeft size={15} />}
              onClick={() => navigate("/app/forms")}
            >
              Forms
            </Button>
            <TextInput
              value={builder.name}
              onChange={(e) => builder.rename(e.currentTarget.value)}
              disabled={!canEdit}
              variant="unstyled"
              styles={{ input: { fontWeight: 650, fontSize: 17 } }}
              style={{ maxWidth: 340, flex: 1 }}
            />
            <Badge
              variant="light"
              color={form.status === "published" ? "teal" : form.status === "closed" ? "orange" : "gray"}
            >
              {form.status === "published" ? "Live" : form.status === "closed" ? "Closed" : "Draft"}
            </Badge>
            {builder.dirty && <Text size="xs" c="dimmed">Unsaved changes</Text>}
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Button
              variant="light"
              size="sm"
              onClick={() => navigate(`/app/forms/${form.id}/responses`)}
              leftSection={<Eye size={15} />}
            >
              Responses
            </Button>
            {canEdit && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  leftSection={<Save size={15} />}
                  onClick={builder.persist}
                  loading={builder.saving}
                  disabled={!builder.dirty}
                >
                  Save
                </Button>
                {form.status === "published" ? (
                  <Button
                    size="sm"
                    variant="light"
                    color="orange"
                    leftSection={<PauseCircle size={15} />}
                    onClick={close}
                    loading={publishing}
                  >
                    Close
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    leftSection={<Send size={15} />}
                    onClick={publish}
                    loading={publishing}
                    disabled={!liveFields.length}
                  >
                    Publish
                  </Button>
                )}
              </>
            )}
          </Group>
        </Group>

        {builder.locked && tab === "build" && (
          <Alert variant="light" color="gray" icon={<Info size={15} />} mb="md" p="xs">
            <Text size="xs">
              This form already has responses. You can add fields and change labels freely, but a
              field's type is fixed and removing one hides it instead — so the responses you have
              already collected keep their columns.
            </Text>
          </Alert>
        )}

        <Tabs value={tab} onChange={(v) => setTab(v ?? "build")}>
          <Tabs.List mb="md">
            <Tabs.Tab value="build">Build</Tabs.Tab>
            <Tabs.Tab value="preview" leftSection={<Eye size={14} />}>Preview</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<Settings size={14} />}>Settings</Tabs.Tab>
            <Tabs.Tab value="share" leftSection={<Share2 size={14} />}>Share</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="build">
            <Group align="flex-start" gap="md" wrap="nowrap">
              {canEdit && (
                <Box
                  className="surface-card"
                  p="sm"
                  style={{ flex: "0 0 260px", position: "sticky", top: 12, alignSelf: "flex-start" }}
                  h="calc(100vh - 240px)"
                >
                  <FieldPalette onAdd={builder.addField} />
                </Box>
              )}

              <ScrollArea flex={1} h="calc(100vh - 240px)" type="hover">
                <Box pb="xl">
                  <FormCanvas
                    title={builder.name}
                    fields={builder.fields}
                    selectedKey={builder.selectedKey}
                    submitText={builder.settings.submitText}
                    onSelect={canEdit ? builder.setSelectedKey : () => {}}
                    onMove={builder.moveField}
                    readOnly={!canEdit}
                  />
                </Box>
              </ScrollArea>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <FormCanvas
              title={builder.name}
              fields={builder.fields}
              selectedKey={null}
              submitText={builder.settings.submitText}
              onSelect={() => {}}
              onMove={() => {}}
              readOnly
            />
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SettingsPanel
              settings={builder.settings}
              fields={builder.fields}
              canRemoveBranding={billing?.forms?.removeBranding ?? false}
              onChange={builder.updateSettings}
            />
          </Tabs.Panel>

          <Tabs.Panel value="share">
            <ShareCard form={form} />
          </Tabs.Panel>
        </Tabs>
      </Box>

      <FieldEditor
        field={builder.selected}
        locked={builder.locked}
        onChange={builder.updateField}
        onClose={() => builder.setSelectedKey(null)}
        onRemove={() => builder.selected && builder.removeField(builder.selected.key)}
      />
    </AppShell>
  );
}
