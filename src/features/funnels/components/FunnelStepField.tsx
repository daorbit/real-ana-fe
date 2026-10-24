import { ActionIcon, Tooltip } from "@mantine/core";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { Draft } from "../lib/funnelDraft";
import type { StepOptionGroup } from "../lib/funnelOptions";
import { FunnelStepPicker } from "./FunnelStepPicker";
import classes from "./Funnels.module.css";

export function FunnelStepField({
  index,
  count,
  step,
  groups,
  removable,
  autoOpen,
  onAutoOpened,
  onChange,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  step: Draft;
  groups: StepOptionGroup[];
  removable: boolean;
  autoOpen: boolean;
  onAutoOpened: () => void;
  onChange: (step: Draft) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <li className={classes.field}>
      <span className={classes.fieldNumber} data-filled={step.value ? true : undefined}>
        {index + 1}
      </span>
      <div className={classes.fieldPicker}>
        <FunnelStepPicker
          index={index}
          step={step}
          groups={groups}
          autoOpen={autoOpen}
          onAutoOpened={onAutoOpened}
          onChange={onChange}
        />
      </div>
      <div className={classes.fieldActions}>
        <Tooltip label="Move up" withArrow>
          <ActionIcon variant="subtle" color="gray" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move step ${index + 1} up`}>
            <ArrowUp size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Move down" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label={`Move step ${index + 1} down`}
          >
            <ArrowDown size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={removable ? "Remove step" : "A funnel needs at least two steps"} withArrow>
          <ActionIcon variant="subtle" color="gray" onClick={onRemove} disabled={!removable} aria-label={`Remove step ${index + 1}`}>
            <X size={15} />
          </ActionIcon>
        </Tooltip>
      </div>
    </li>
  );
}
