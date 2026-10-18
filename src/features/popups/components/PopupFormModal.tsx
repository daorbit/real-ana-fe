import { useEffect, useMemo, useState } from "react";
import { Anchor, Button, Group, Modal, NumberInput, SegmentedControl, Select, Stack, TagsInput, Text, TextInput } from "@mantine/core";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSites } from "@/features/workspace";
import { useDemo } from "@/features/demo/context";
import { useGetPublishedFormsQuery } from "@/features/popups/api";
import { DEVICE_OPTIONS, LAYOUT_OPTIONS, PAGE_MODE_OPTIONS, defaultPopup } from "@/features/popups/lib/popupOptions";
import type { PopupInput } from "@/features/popups/types";
import { TriggerPicker } from "@/features/popups/components/TriggerPicker";
import classes from "@/features/popups/components/Popups.module.css";

export function PopupFormModal({
  opened,
  workspaceId,
  initial,
  editing,
  saving,
  onClose,
  onSubmit,
}: {
  opened: boolean;
  workspaceId: string;
  initial: PopupInput | null;
  editing: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: PopupInput) => void;
}) {
  const { demo } = useDemo();
  const { sites } = useSites(workspaceId);
  const formsQuery = useGetPublishedFormsQuery(opened && !demo ? workspaceId : skipToken);
  const [form, setForm] = useState<PopupInput>(defaultPopup());
  const firstSiteId = sites[0]?.siteId ?? "";

  useEffect(() => {
    if (!opened) return;
    setForm(initial ?? defaultPopup(firstSiteId));
  }, [opened, initial, firstSiteId]);

  const formOptions = useMemo(() => {
    const options = (formsQuery.data ?? []).map((f) => ({ value: f._id, label: f.title || f.name || "Untitled form" }));
    if (form.formId && !options.some((o) => o.value === form.formId)) {
      options.unshift({ value: form.formId, label: form.formTitle || "Current form" });
    }
    return options;
  }, [formsQuery.data, form.formId, form.formTitle]);

  const siteOptions = sites.map((s) => ({ value: s.siteId, label: s.name }));
  const set = (patch: Partial<PopupInput>) => setForm((f) => ({ ...f, ...patch }));
  const needsPages = form.pages.mode !== "all";
  const valid = Boolean(form.name.trim() && form.siteId && form.formId && (!needsPages || form.pages.patterns.length));

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={650}>{editing ? "Edit popup" : "New popup"}</Text>} size="lg" radius="lg" centered>
      <Stack gap="lg">
        <TextInput label="Name" placeholder="Exit offer on pricing" value={form.name} maxLength={80} onChange={(e) => set({ name: e.currentTarget.value })} />

        <Group grow align="flex-start">
          <Select label="Site" data={siteOptions} value={form.siteId || null} allowDeselect={false} onChange={(v) => set({ siteId: v ?? "" })} />
          <Select
            label="Form"
            placeholder={formsQuery.isFetching ? "Loading forms…" : "Pick a published form"}
            data={formOptions}
            value={form.formId || null}
            searchable
            nothingFoundMessage="No published forms yet"
            onChange={(v) => set({ formId: v ?? "", formTitle: formOptions.find((o) => o.value === v)?.label ?? "" })}
          />
        </Group>
        {!formsQuery.isFetching && formOptions.length === 0 && (
          <Text className={classes.note}>
            Publish a form in{" "}
            <Anchor component={Link} to="/app/lead-capture" size="xs">
              Lead capture
            </Anchor>{" "}
            first, then pick it here.
          </Text>
        )}

        <div>
          <Text size="sm" fw={500} mb={8}>
            When it opens
          </Text>
          <Stack gap="sm">
            <TriggerPicker trigger={form.trigger} onChange={(patch) => set({ trigger: { ...form.trigger, ...patch } })} />
          </Stack>
        </div>

        <Group grow align="flex-start">
          <div>
            <Text size="sm" fw={500} mb={6}>
              Style
            </Text>
            <SegmentedControl fullWidth data={LAYOUT_OPTIONS} value={form.layout} onChange={(v) => set({ layout: v as PopupInput["layout"] })} />
          </div>
          <div>
            <Text size="sm" fw={500} mb={6}>
              Devices
            </Text>
            <SegmentedControl fullWidth data={DEVICE_OPTIONS} value={form.devices} onChange={(v) => set({ devices: v as PopupInput["devices"] })} />
          </div>
        </Group>

        <Stack gap="xs">
          <Select
            label="Pages"
            data={PAGE_MODE_OPTIONS}
            value={form.pages.mode}
            allowDeselect={false}
            onChange={(v) => set({ pages: { ...form.pages, mode: (v ?? "all") as PopupInput["pages"]["mode"] } })}
          />
          {needsPages && (
            <TagsInput
              placeholder="/pricing, /blog/*"
              description="Paths on your site. Use * as a wildcard. Press Enter after each one."
              maxTags={10}
              value={form.pages.patterns}
              onChange={(patterns) => set({ pages: { ...form.pages, patterns } })}
            />
          )}
        </Stack>

        <NumberInput
          label="Show again after"
          description="Days before the same visitor sees it again. 0 shows it once per visit. Anyone who submits never sees it again."
          suffix=" days"
          min={0}
          max={365}
          allowDecimal={false}
          clampBehavior="strict"
          value={form.showAgainDays}
          onChange={(v) => set({ showAgainDays: Number(v) || 0 })}
        />

        <Group justify="space-between" align="center">
          <Text className={classes.note}>Runs through your Quantalog tracking script. Changes reach your site within 5 minutes.</Text>
          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!valid} loading={saving} onClick={() => onSubmit({ ...form, name: form.name.trim() })}>
              {editing ? "Save popup" : "Create popup"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
