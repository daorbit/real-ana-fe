import { Select } from "@mantine/core";
import type { WorkspaceRole } from "@/shared/types";
import { ROLE_META, roleLabel } from "./roles";
import classes from "./Members.module.css";

export function RoleSelect({
  value,
  options,
  label,
  onChange,
}: {
  value: WorkspaceRole;
  options: WorkspaceRole[];
  label: string;
  onChange: (role: WorkspaceRole) => void;
}) {
  return (
    <Select
      variant="unstyled"
      value={value}
      data={options.map((r) => ({ value: r, label: roleLabel(r) }))}
      onChange={(v) => v && v !== value && onChange(v as WorkspaceRole)}
      allowDeselect={false}
      aria-label={label}
      classNames={{ input: classes.roleInput }}
      comboboxProps={{ width: 280, position: "bottom-start" }}
      renderOption={({ option }) => (
        <div className={classes.option}>
          <span className={classes.optionName}>{option.label}</span>
          <span className={classes.optionBlurb}>{ROLE_META[option.value as WorkspaceRole].blurb}</span>
        </div>
      )}
    />
  );
}
