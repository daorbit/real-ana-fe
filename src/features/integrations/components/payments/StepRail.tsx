import { Button, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { AsideBlock, SetupChecklist } from "../studio/StudioParts";
import { STEPS, type StepId } from "./providerCopy";
import type { ProviderSettings } from "../../types";
import classes from "./Payments.module.css";

interface Props {
  view: ProviderSettings | undefined;
  step: StepId;
  stepDone: Record<StepId, boolean>;
  isDefault: boolean;
  saving: boolean;
  onStep: (step: StepId) => void;
  onMakeDefault: () => void;
}

export function StepRail({ view, step, stepDone, isDefault, saving, onStep, onMakeDefault }: Props) {
  return (
    <>
      <AsideBlock label="Setup steps">
        <Stack gap={4}>
          {STEPS.map((s, index) => (
            <button
              key={s.id}
              type="button"
              className={classes.step}
              data-active={step === s.id}
              onClick={() => onStep(s.id)}
            >
              <span className={classes.stepIndex} data-done={stepDone[s.id]}>
                {stepDone[s.id] ? <Check size={13} /> : index + 1}
              </span>
              <span className={classes.stepText}>
                <Text size="sm" fw={550}>
                  {s.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {s.hint}
                </Text>
              </span>
            </button>
          ))}
        </Stack>
      </AsideBlock>

      <AsideBlock label="Status">
        <SetupChecklist items={(view?.checklist ?? []).map((item) => ({ label: item.label, done: item.done }))} />
      </AsideBlock>

      <AsideBlock label="Default gateway">
        {isDefault ? (
          <Text size="sm" c="dimmed">
            Forms that do not pick a gateway charge through {view?.label ?? "this one"}.
          </Text>
        ) : (
          <Stack gap={6} align="flex-start">
            <Text size="sm" c="dimmed">
              Forms that do not pick a gateway use another one.
            </Text>
            <Button
              type="button"
              size="compact-sm"
              variant="default"
              disabled={saving || !view?.enabled}
              onClick={onMakeDefault}
            >
              Make {view?.label ?? "this"} the default
            </Button>
          </Stack>
        )}
      </AsideBlock>
    </>
  );
}
