import { useEffect, useState } from "react";
import { Button, CloseButton, Input, Modal, SegmentedControl, TextInput } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { SearchRequirementNote } from "@/features/dashboards/components/templates/SearchRequirementNote";
import { defaultDashboardName } from "@/features/dashboards/hooks/useCreateDashboard";
import { widgetIcon } from "@/features/dashboards/widgetIcons";
import { layoutMix } from "@/features/dashboards/templates";
import { DASHBOARD_RANGES } from "@/features/dashboards/types";
import type { DashboardRange } from "@/features/dashboards/types";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

const RANGE_OPTIONS = DASHBOARD_RANGES.map((r) => ({ value: r.value, label: `Last ${r.label}` }));

export function TemplatePreviewModal({
  template,
  onClose,
  onCreate,
}: {
  template: DashboardTemplate | null;
  onClose: () => void;
  onCreate: (template: DashboardTemplate, name: string, range: DashboardRange) => void;
}) {
  const [name, setName] = useState("");
  const [range, setRange] = useState<DashboardRange>("7d");

  useEffect(() => {
    if (!template) return;
    setName(defaultDashboardName(template.id));
    setRange(template.range);
  }, [template]);

  if (!template) return <Modal opened={false} onClose={onClose} />;

  const Icon = template.icon;
  const blank = template.layout.length === 0;
  const mix = layoutMix(template.layout);
  const searchCount = mix.find((m) => m.group === "Search")?.count ?? 0;
  const submit = () => name.trim() && onCreate(template, name, range);

  return (
    <Modal
      opened
      onClose={onClose}
      size={1080}
      radius="lg"
      padding={0}
      centered
      withCloseButton={false}
      overlayProps={{ blur: 4, backgroundOpacity: 0.55 }}
    >
      <div className={`${classes.preview} ${shared.accent}`} data-accent={template.accent}>
        <div className={classes.previewStage}>
          <MiniWindow layout={template.layout} title={name.trim() || template.name} size="lg" />
        </div>

        <div className={classes.previewBody}>
          <CloseButton className={classes.previewClose} onClick={onClose} aria-label="Close" />

          <span className={classes.eyebrow}>
            <span className={classes.eyebrowIcon}><Icon size={15} /></span>
            {template.category ?? "Start fresh"}
          </span>
          <h2 className={classes.previewTitle}>{blank ? "Blank canvas" : template.name}</h2>
          <p className={classes.previewDesc}>{template.description}</p>

          {mix.length > 0 && (
            <div className={classes.mix}>
              {mix.map((m) => (
                <div key={m.group} className={classes.mixItem}>
                  <span className={classes.mixValue}>{m.count}</span>
                  <span className={classes.mixLabel}>{m.group}</span>
                </div>
              ))}
            </div>
          )}

          {!blank && (
            <div>
              <div className={classes.sectionLabel}>Included widgets</div>
              <div className={classes.widgetList}>
                {template.layout.map((p) => {
                  const WidgetIcon = widgetIcon(p.id);
                  return (
                    <span key={p.id} className={classes.widgetChip}>
                      <WidgetIcon size={12} />
                      {WIDGET_MAP[p.id]?.label ?? p.id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {searchCount > 0 && <SearchRequirementNote count={searchCount} />}

          <div className={classes.form}>
            <TextInput
              label="Dashboard name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              data-autofocus
            />
            <Input.Wrapper label="Date range">
              <SegmentedControl
                fullWidth
                value={range}
                onChange={(v) => setRange(v as DashboardRange)}
                data={RANGE_OPTIONS}
              />
            </Input.Wrapper>
            <div className={classes.formActions}>
              <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
              <Button color="emerald" rightSection={<ArrowRight size={15} />} disabled={!name.trim()} onClick={submit}>
                {blank ? "Create blank dashboard" : "Create dashboard"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
