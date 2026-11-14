import classes from "./Segmented.module.css";

export function Segmented<T extends string>({
  value,
  options,
  label,
  size = "md",
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  label: string;
  size?: "sm" | "md";
  onChange: (value: T) => void;
}) {
  return (
    <div className={classes.track} role="radiogroup" aria-label={label} data-size={size}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={classes.segment}
          data-active={option.value === value || undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
