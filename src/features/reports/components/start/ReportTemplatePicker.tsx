import { useState } from "react";
import { Button, UnstyledButton } from "@mantine/core";
import { ArrowRight, Check } from "lucide-react";
import type { Draft } from "@/features/reports/pages/types";
import { REPORT_TEMPLATES } from "./reportTemplates";
import { ReportEmailPreview } from "./ReportEmailPreview";
import classes from "./ReportsStart.module.css";

export function ReportTemplatePicker({
  canEdit,
  disabled,
  workspace,
  onCreate,
}: {
  canEdit: boolean;
  disabled: boolean;
  workspace: string;
  onCreate: (preset?: Partial<Draft>) => void;
}) {
  const [selectedId, setSelectedId] = useState(REPORT_TEMPLATES[0].id);
  const selected = REPORT_TEMPLATES.find((t) => t.id === selectedId) ?? REPORT_TEMPLATES[0];

  return (
    <section className={classes.picker} aria-labelledby="reports-start-templates">
      <div className={classes.pickerSide}>
        <h3 id="reports-start-templates" className={classes.pickerTitle}>
          {canEdit ? "Pick a starting point" : "What a report can look like"}
        </h3>
        <p className={classes.pickerSub}>Everything can be changed before you save — sites, recipients and timing.</p>

        <div className={classes.options} role="radiogroup" aria-label="Report templates">
          {REPORT_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const on = tpl.id === selected.id;
            return (
              <UnstyledButton
                key={tpl.id}
                role="radio"
                aria-checked={on}
                data-active={on || undefined}
                className={classes.option}
                onClick={() => setSelectedId(tpl.id)}
              >
                <span className={classes.optionIcon}>
                  <Icon size={15} />
                </span>
                <span className={classes.optionText}>
                  <span className={classes.optionTitle}>{tpl.title}</span>
                  <span className={classes.optionSub}>{tpl.text}</span>
                </span>
                <span className={classes.optionCheck}>{on && <Check size={14} />}</span>
              </UnstyledButton>
            );
          })}
        </div>

        {canEdit && (
          <Button
            variant="default"
            rightSection={<ArrowRight size={15} />}
            disabled={disabled}
            onClick={() => onCreate(selected.preset)}
            className={classes.useButton}
          >
            Use {selected.title.toLowerCase()}
          </Button>
        )}
      </div>

      <div className={classes.previewPane}>
        <ReportEmailPreview template={selected} workspace={workspace} />
      </div>
    </section>
  );
}
