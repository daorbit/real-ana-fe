import { Button, Input, MultiSelect, SegmentedControl, TextInput } from "@mantine/core";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { widgetIcon } from "@/features/dashboards/widgetIcons";
import { DASHBOARD_RANGES } from "@/features/dashboards/types";
import type { DashboardRange, Embed, EmbedTheme } from "@/features/dashboards/types";
import type { EmbedDraft } from "@/features/dashboards/hooks/useEmbedEditor";
import classes from "@/features/dashboards/components/embeds/Embeds.module.css";

const THEMES: { value: EmbedTheme; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const RANGES = DASHBOARD_RANGES.map((r) => ({ value: r.value, label: r.label }));

export function EmbedSettings({
  embed,
  draft,
  sites,
  creating,
  onName,
  onCommitName,
  onChange,
  onChangeWidget,
  onSubmit,
}: {
  embed: Embed | null;
  draft: EmbedDraft;
  sites: { siteId: string; name: string }[];
  creating: boolean;
  onName: (name: string) => void;
  onCommitName: () => void;
  onChange: (patch: Partial<EmbedDraft>) => void;
  onChangeWidget?: () => void;
  onSubmit: () => void;
}) {
  const Icon = widgetIcon(draft.widget);
  const widget = WIDGET_MAP[draft.widget];

  return (
    <div className={classes.settings}>
      <div className={classes.chosen}>
        <span className={classes.pickIcon}><Icon size={17} /></span>
        <span className={classes.pickText}>
          <span className={classes.pickName}>{widget?.label ?? draft.widget}</span>
          <span className={classes.pickDesc}>{widget?.description}</span>
        </span>
        {!embed && onChangeWidget && (
          <Button variant="subtle" color="gray" size="compact-sm" ml="auto" onClick={onChangeWidget}>
            Change
          </Button>
        )}
      </div>

      <TextInput
        label="Name"
        description="Shown on the widget and used as the iframe title."
        value={draft.name}
        maxLength={80}
        onChange={(e) => onName(e.currentTarget.value)}
        onBlur={onCommitName}
      />
      <Input.Wrapper label="Period">
        <SegmentedControl
          fullWidth
          color="emerald"
          value={draft.range}
          onChange={(v) => onChange({ range: v as DashboardRange })}
          data={RANGES}
        />
      </Input.Wrapper>
      <Input.Wrapper label="Theme">
        <SegmentedControl
          fullWidth
          value={draft.theme}
          onChange={(v) => onChange({ theme: v as EmbedTheme })}
          data={THEMES}
        />
      </Input.Wrapper>
      {sites.length > 1 && (
        <MultiSelect
          label="Sites"
          placeholder={draft.sites.length ? undefined : "All sites"}
          data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
          value={draft.sites}
          onChange={(v) => onChange({ sites: v })}
          clearable
        />
      )}

      <div className={classes.note}>
        <ShieldCheck size={15} />
        Anyone who can see the page you embed this on can read these numbers. Only this widget's data is published.
      </div>

      {!embed && (
        <Button
          color="emerald"
          rightSection={<ArrowRight size={15} />}
          onClick={onSubmit}
          loading={creating}
          disabled={!draft.name.trim()}
        >
          Create embed
        </Button>
      )}
    </div>
  );
}
