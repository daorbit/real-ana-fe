import classes from "./Toggle.module.css";

export function Toggle({
  checked,
  label,
  size = "md",
  onChange,
}: {
  checked: boolean;
  label: string;
  size?: "sm" | "md";
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={classes.toggle}
      data-size={size}
      data-on={checked || undefined}
      onClick={() => onChange(!checked)}
    >
      <span className={classes.knob} />
    </button>
  );
}
