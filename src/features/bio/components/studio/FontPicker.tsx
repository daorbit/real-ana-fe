import { BIO_FONTS } from "@/features/bio/lib/bioOptions";
import type { BioFont } from "@/features/bio/types";
import classes from "./Design.module.css";

export function FontPicker({ value, onChange }: { value: BioFont; onChange: (font: BioFont) => void }) {
  return (
    <div className={classes.fonts} role="radiogroup" aria-label="Font">
      {BIO_FONTS.map((font) => (
        <button
          type="button"
          key={font.value}
          role="radio"
          aria-checked={font.value === value}
          className={classes.fontOption}
          data-active={font.value === value || undefined}
          onClick={() => onChange(font.value)}
        >
          <span className={classes.fontSample} data-font={font.value}>
            Aa
          </span>
          <span className={classes.optionLabel}>{font.label}</span>
        </button>
      ))}
    </div>
  );
}
