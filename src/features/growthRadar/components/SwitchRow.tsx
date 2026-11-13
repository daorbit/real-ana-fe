import { Switch } from "@mantine/core";
import rows from "./Rows.module.css";

export function SwitchRow({
  title,
  hint,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={rows.settingRow}>
      <div className={rows.settingHead}>
        <span className={rows.settingText}>
          <span className={rows.settingTitle}>{title}</span>
          <span className={rows.settingHint}>{hint}</span>
        </span>
        <Switch checked={checked} disabled={disabled} aria-label={title} onChange={(e) => onChange(e.currentTarget.checked)} />
      </div>
    </div>
  );
}
