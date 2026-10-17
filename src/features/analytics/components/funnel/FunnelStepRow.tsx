import { ActionIcon, SegmentedControl, Select } from "@mantine/core";
import { X } from "lucide-react";
import type { Draft } from "../FunnelStepEditor";
import classes from "./Funnel.module.css";

type Option = { value: string; label: string };

const KINDS = [
  { value: "page", label: "Page" },
  { value: "event", label: "Event" },
];

export function FunnelStepRow({
  index,
  step,
  pageOptions,
  eventOptions,
  removable,
  onChange,
  onRemove,
}: {
  index: number;
  step: Draft;
  pageOptions: Option[];
  eventOptions: Option[];
  removable: boolean;
  onChange: (patch: Partial<Draft>) => void;
  onRemove: () => void;
}) {
  const isPage = step.type === "page";

  return (
    <li className={classes.step} data-filled={step.value ? true : undefined}>
      <span className={classes.marker}>{index + 1}</span>
      <div className={classes.stepFields}>
        <SegmentedControl
          className={classes.stepKind}
          size="xs"
          radius="xl"
          data={KINDS}
          value={step.type}
          onChange={(v) => onChange({ type: v as Draft["type"], value: "" })}
        />
        <Select
          className={classes.stepValue}
          size="sm"
          radius="md"
          aria-label={`Step ${index + 1}`}
          placeholder={isPage ? "Choose a page" : "Choose an event"}
          data={isPage ? pageOptions : eventOptions}
          value={step.value || null}
          onChange={(v) => onChange({ value: v ?? "" })}
          searchable
          nothingFoundMessage={isPage ? "No pages with traffic yet" : "No events tracked yet"}
          comboboxProps={{ withinPortal: true }}
        />
      </div>
      <ActionIcon
        variant="subtle"
        color="gray"
        radius="xl"
        onClick={onRemove}
        disabled={!removable}
        aria-label={`Remove step ${index + 1}`}
      >
        <X size={15} />
      </ActionIcon>
    </li>
  );
}
