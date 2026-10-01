import { Loader, Modal } from "@mantine/core";
import { Check } from "lucide-react";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { useBuildProgress } from "@/features/dashboards/hooks/useBuildProgress";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/Dashboards.module.css";

type StepState = "pending" | "active" | "done";

function stateOf(index: number, phase: number): StepState {
  if (index < phase) return "done";
  return index === phase ? "active" : "pending";
}

export function BuildingDialog({
  template,
  name,
}: {
  template: DashboardTemplate | null;
  name: string;
}) {
  const total = Math.min(template?.layout.length ?? 0, 16);
  const { phase, revealed } = useBuildProgress(Boolean(template), total);

  const steps = [
    { label: "Creating the dashboard" },
    {
      label: total ? "Placing widgets" : "Preparing an empty canvas",
      count: total ? `${Math.min(revealed, total)}/${total}` : undefined,
    },
    { label: total ? "Loading your numbers" : "Opening the widget picker" },
  ];

  return (
    <Modal
      opened={Boolean(template)}
      onClose={() => undefined}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      radius="lg"
      padding={0}
      size={440}
      overlayProps={{ blur: 6, backgroundOpacity: 0.6 }}
    >
      {template && (
        <div className={`${classes.build} ${classes.accent}`} data-accent={template.accent} aria-live="polite">
          <div className={classes.buildStage}>
            <MiniWindow layout={template.layout} title={name} revealed={revealed} />
          </div>
          <div className={classes.buildBody}>
            <div>
              <h2 className={classes.buildTitle}>Building your dashboard</h2>
              <div className={classes.buildName}>{name}</div>
            </div>
            <ul className={classes.steps}>
              {steps.map((s, i) => {
                const state = stateOf(i, phase);
                return (
                  <li key={s.label} className={classes.step} data-state={state}>
                    <span className={classes.stepMark}>
                      {state === "done" && <Check size={13} strokeWidth={3} />}
                      {state === "active" && <Loader size={12} color="gray" />}
                    </span>
                    {s.label}
                    {s.count && state !== "pending" && <span className={classes.stepCount}>{s.count}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
