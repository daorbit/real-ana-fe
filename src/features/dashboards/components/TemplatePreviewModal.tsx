import { useEffect, useState } from "react";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { ArrowRight, CalendarRange, LayoutGrid } from "lucide-react";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { LayoutThumb } from "@/features/dashboards/components/LayoutThumb";
import { defaultDashboardName } from "@/features/dashboards/hooks/useCreateDashboard";
import { rangeLong } from "@/features/dashboards/types";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function TemplatePreviewModal({
  template,
  onClose,
  onCreate,
}: {
  template: DashboardTemplate | null;
  onClose: () => void;
  onCreate: (template: DashboardTemplate, name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (template) setName(defaultDashboardName(template.id));
  }, [template]);

  if (!template) return <Modal opened={false} onClose={onClose} />;

  const Icon = template.icon;
  const submit = () => name.trim() && onCreate(template, name);

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
      <div className={`${classes.pvLayout} ${classes.accent}`} data-accent={template.accent}>
        <div className={classes.pvStage}>
          <LayoutThumb layout={template.layout} />
        </div>

        <div className={classes.pvBody}>
          <div className={classes.pvHead}>
            <span className={classes.titleIcon}><Icon size={18} /></span>
            <span className={classes.pvCategory}>{template.category ?? "Start fresh"}</span>
          </div>
          <h2 className={classes.pvTitle}>{template.name}</h2>
          <p className={classes.pvDesc}>{template.description}</p>

          <div className={classes.metaRow}>
            <span className={classes.metaTag}><LayoutGrid size={11} />{template.layout.length || "No"} widgets</span>
            <span className={classes.metaTag}><CalendarRange size={11} />{rangeLong(template.range)}</span>
          </div>

          {template.layout.length > 0 && (
            <div>
              <div className={classes.pvLabel}>Included</div>
              <div className={classes.widgetChips}>
                {template.layout.map((p) => (
                  <span key={p.id} className={classes.widgetChip}>{WIDGET_MAP[p.id]?.label ?? p.id}</span>
                ))}
              </div>
            </div>
          )}

          <div className={classes.pvFoot}>
            <TextInput
              label="Dashboard name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              data-autofocus
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
              <Button
                color="emerald"
                radius="xl"
                rightSection={<ArrowRight size={15} />}
                disabled={!name.trim()}
                onClick={submit}
              >
                {template.layout.length ? "Use this template" : "Create blank dashboard"}
              </Button>
            </Group>
          </div>
        </div>
      </div>
    </Modal>
  );
}
