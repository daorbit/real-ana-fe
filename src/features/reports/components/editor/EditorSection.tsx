import type { ReactNode, Ref } from "react";
import { Switch } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import classes from "./Editor.module.css";

export type FormSection = "schedule" | "content" | "delivery";

export function EditorSection({
  id,
  title,
  description,
  sectionRef,
  children,
}: {
  id: FormSection;
  title: string;
  description: string;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
  children: ReactNode;
}) {
  return (
    <section ref={sectionRef(id)} className={classes.block} aria-labelledby={`report-${id}`}>
      <div className={classes.blockHead}>
        <h3 id={`report-${id}`} className={classes.blockTitle}>
          {title}
        </h3>
        <p className={classes.blockDesc}>{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SettingsGroup({ children }: { children: ReactNode }) {
  return <div className={classes.group}>{children}</div>;
}

export function SettingsField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={classes.field}>
      <span className={classes.fieldLabel}>{label}</span>
      {children}
      {hint && <span className={classes.fieldHint}>{hint}</span>}
    </div>
  );
}

export function SettingRow({
  icon: Icon,
  label,
  hint,
  checked,
  disabled,
  onChange,
  children,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className={classes.row}>
      <label className={classes.rowMain} data-disabled={disabled || undefined}>
        <span className={classes.rowIcon}>
          <Icon size={15} />
        </span>
        <span className={classes.rowText}>
          <span className={classes.rowLabel}>{label}</span>
          <span className={classes.rowHint}>{hint}</span>
        </span>
        <Switch
          size="sm"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.currentTarget.checked)}
          aria-label={label}
        />
      </label>
      {checked && children && <div className={classes.rowDetail}>{children}</div>}
    </div>
  );
}
