import { Button, Modal, MultiSelect, SegmentedControl, Select, Stack, Text, TextInput } from "@mantine/core";
import { useSites } from "@/features/workspace";
import { EMBEDDABLE_WIDGETS, WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { EmbedPreview } from "@/features/dashboards/components/EmbedPreview";
import { EmbedCode } from "@/features/dashboards/components/EmbedCode";
import { useEmbedEditor } from "@/features/dashboards/hooks/useEmbedEditor";
import { DASHBOARD_RANGES } from "@/features/dashboards/types";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import type { DashboardRange, EmbedTheme } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/Dashboards.module.css";

const THEMES: { value: EmbedTheme; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function EmbedModal({
  opened,
  workspaceId,
  embedId,
  initialWidget,
  initialRange,
  onClose,
}: {
  opened: boolean;
  workspaceId: string;
  embedId: string | null;
  initialWidget: WidgetId | null;
  initialRange?: DashboardRange;
  onClose: () => void;
}) {
  const { sites } = useSites(workspaceId);
  const { embed, draft, setDraft, setWidget, change, submit, creating } = useEmbedEditor({
    workspaceId, opened, embedId, initialWidget, initialRange,
  });

  const version = `${draft.range}:${draft.theme}:${draft.sites.join(",")}:${embed?.enabled}`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={960}
      radius="lg"
      centered
      title={<Text fw={650}>{embed ? "Embed widget" : "New embed"}</Text>}
    >
      <div className={classes.embedLayout}>
        <Stack gap="md">
          <Select
            label="Widget"
            data={EMBEDDABLE_WIDGETS.map((id) => ({ value: id, label: WIDGET_MAP[id].label }))}
            value={draft.widget}
            onChange={(v) => v && setWidget(v as WidgetId)}
            disabled={Boolean(embed)}
            allowDeselect={false}
            searchable
          />
          <TextInput
            label="Name"
            description="Shown on the widget and used as the iframe title."
            value={draft.name}
            maxLength={80}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.currentTarget.value }))}
            onBlur={() => embed && draft.name.trim() && draft.name !== embed.name && change({ name: draft.name.trim() })}
          />
          <div>
            <Text size="sm" fw={500} mb={6}>Period</Text>
            <SegmentedControl
              fullWidth
              color="emerald"
              value={draft.range}
              onChange={(v) => change({ range: v as DashboardRange })}
              data={DASHBOARD_RANGES.map((r) => ({ value: r.value, label: r.label }))}
            />
          </div>
          <div>
            <Text size="sm" fw={500} mb={6}>Theme</Text>
            <SegmentedControl
              fullWidth
              value={draft.theme}
              onChange={(v) => change({ theme: v as EmbedTheme })}
              data={THEMES}
            />
          </div>
          {sites.length > 1 && (
            <MultiSelect
              label="Sites"
              placeholder={draft.sites.length ? undefined : "All sites"}
              data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
              value={draft.sites}
              onChange={(v) => change({ sites: v })}
              clearable
            />
          )}
          <Text size="xs" c="dimmed">
            Anyone who can see the page you embed this on can read these numbers. Only this widget's data is published.
          </Text>
          {!embed && (
            <Button color="emerald" onClick={submit} loading={creating} disabled={!draft.name.trim()}>
              Create embed
            </Button>
          )}
        </Stack>

        <div className={classes.previewPane}>
          <EmbedPreview token={embed?.token ?? null} widget={draft.widget} version={version} />
          {embed && <EmbedCode token={embed.token} widget={embed.widget} name={embed.name} />}
        </div>
      </div>
    </Modal>
  );
}
