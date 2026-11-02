import type { ReactNode } from "react";
import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { CalendarArrowUp, CalendarDays, ChevronsUpDown, Columns3, Flag, ListTree } from "lucide-react";
import { PRIORITY_LABEL, PRIORITY_ORDER, STATUS_LABEL, STATUS_ORDER } from "../../lib/board";
import { taskOption } from "../../lib/relations";
import type { TaskForm } from "../../hooks/useTaskEditor";
import type { Bucket, Task, TaskPriority, TaskStatus } from "../../types";
import { ProgressGlyph } from "../TaskBits";
import classes from "./TaskDialog.module.css";

const SELECT_PROPS = {
  variant: "unstyled",
  allowDeselect: false,
  rightSection: <ChevronsUpDown size={12} />,
  rightSectionPointerEvents: "none",
  comboboxProps: { position: "bottom-end", width: 230 },
  classNames: { root: classes.settingControl, input: classes.settingInput },
} as const;

const DATE_PROPS = {
  variant: "unstyled",
  valueFormat: "D MMM YYYY",
  placeholder: "None",
  clearable: true,
  classNames: { root: classes.settingControl, input: classes.settingInput },
  popoverProps: { radius: "lg", shadow: "lg", position: "bottom-end" },
} as const;

function SettingRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className={classes.settingRow}>
      <span className={classes.settingLabel}>
        <span className={classes.settingIcon}>{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}

export function TaskSettings({
  form,
  readOnly,
  buckets,
  parent,
  parents,
  onChange,
}: {
  form: TaskForm;
  readOnly: boolean;
  buckets: Bucket[];
  parent: Task | undefined;
  parents: Task[];
  onChange: (patch: Partial<TaskForm>) => void;
}) {
  const parentChoices = parent && !parents.includes(parent) ? [parent, ...parents] : parents;

  return (
    <div className={classes.group}>
      <SettingRow icon={<ProgressGlyph status={form.status} size={14} />} label="Progress">
        <Select
          {...SELECT_PROPS}
          aria-label="Progress"
          readOnly={readOnly}
          value={form.status}
          onChange={(v) => v && onChange({ status: v as TaskStatus })}
          data={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
        />
      </SettingRow>
      <SettingRow icon={<Flag size={14} />} label="Priority">
        <Select
          {...SELECT_PROPS}
          aria-label="Priority"
          readOnly={readOnly}
          value={form.priority}
          onChange={(v) => v && onChange({ priority: v as TaskPriority })}
          data={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
        />
      </SettingRow>
      <SettingRow icon={<Columns3 size={14} />} label="Bucket">
        <Select
          {...SELECT_PROPS}
          aria-label="Bucket"
          readOnly={readOnly}
          value={form.bucketId}
          onChange={(v) => v && onChange({ bucketId: v })}
          data={buckets.map((b) => ({ value: b.id, label: b.name }))}
        />
      </SettingRow>
      {parentChoices.length > 0 && (
        <SettingRow icon={<ListTree size={14} />} label="Parent task">
          <Select
            {...SELECT_PROPS}
            allowDeselect
            searchable
            clearable
            rightSection={undefined}
            rightSectionPointerEvents={undefined}
            aria-label="Parent task"
            placeholder="Not a subtask"
            nothingFoundMessage="No matching tasks"
            readOnly={readOnly}
            value={form.parentId}
            onChange={(v) => onChange({ parentId: v ?? null })}
            data={parentChoices.map(taskOption)}
            comboboxProps={{ position: "bottom-end", width: 280 }}
          />
        </SettingRow>
      )}
      <SettingRow icon={<CalendarArrowUp size={14} />} label="Start date">
        <DatePickerInput
          {...DATE_PROPS}
          aria-label="Start date"
          readOnly={readOnly}
          value={form.start || null}
          maxDate={form.due || undefined}
          onChange={(value) => onChange({ start: value ?? "" })}
        />
      </SettingRow>
      <SettingRow icon={<CalendarDays size={14} />} label="Due date">
        <DatePickerInput
          {...DATE_PROPS}
          aria-label="Due date"
          readOnly={readOnly}
          value={form.due || null}
          minDate={form.start || undefined}
          onChange={(value) => onChange({ due: value ?? "" })}
        />
      </SettingRow>
    </div>
  );
}
