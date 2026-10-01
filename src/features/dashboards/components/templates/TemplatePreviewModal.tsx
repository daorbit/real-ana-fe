import { useEffect, useState } from "react";
import { Button, CloseButton, Input, Modal, SegmentedControl, TextInput } from "@mantine/core";
import { ArrowRight, CalendarRange, LayoutGrid } from "lucide-react";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { SearchRequirementNote } from "@/features/dashboards/components/templates/SearchRequirementNote";
import { TemplateWidgetGroups } from "@/features/dashboards/components/templates/TemplateWidgetGroups";
import { defaultDashboardName } from "@/features/dashboards/hooks/useCreateDashboard";
import { isSearchWidget } from "@/features/analytics/widgetCatalog";
import { DASHBOARD_RANGES, rangeLong } from "@/features/dashboards/types";
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
  const count = template.layout.length;
  const blank = count === 0;
  const searchCount = template.layout.filter((p) => isSearchWidget(p.id)).length;
  const submit = () => name.trim() && onCreate(template, name, range);

  return (
    <Modal
      opened
      onClose={onClose}
      size={1040}
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
          <div className={classes.previewScroll}>
            <div className={classes.previewHead}>
              <span className={classes.eyebrow}>
                <span className={classes.eyebrowIcon}><Icon size={15} /></span>
                {template.category ?? "Start fresh"}
              </span>
              <CloseButton onClick={onClose} aria-label="Close" />
            </div>

            <div>
              <h2 className={classes.previewTitle}>{blank ? "Blank canvas" : template.name}</h2>
              <p className={classes.previewDesc}>{template.description}</p>
              <div className={classes.previewFacts}>
                <span><LayoutGrid size={13} />{blank ? "Pick your own widgets" : `${count} widgets`}</span>
                <span><CalendarRange size={13} />Starts on {rangeLong(template.range)}</span>
              </div>
            </div>

            {!blank && (
              <div>
                <div className={classes.sectionLabel}>What's inside</div>
                <TemplateWidgetGroups layout={template.layout} />
              </div>
            )}

            {searchCount > 0 && <SearchRequirementNote count={searchCount} />}
          </div>

          <div className={classes.previewFooter}>
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
