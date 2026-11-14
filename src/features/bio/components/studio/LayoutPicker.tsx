import { useMemo } from "react";
import { toPreviewPage } from "@/features/bio/lib/bioDraft";
import { layoutFor, layoutsFor } from "@/features/bio/lib/bioOptions";
import type { BioLayout, BioPageInput } from "@/features/bio/types";
import { PhoneThumb } from "../PhoneThumb";
import classes from "./Design.module.css";

export function LayoutPicker({ draft, onChange }: { draft: BioPageInput; onChange: (layout: BioLayout) => void }) {
  const current = layoutFor(draft.kind, draft.theme.layout);
  const options = useMemo(
    () =>
      layoutsFor(draft.kind).map((option) => ({
        ...option,
        page: toPreviewPage({ ...draft, theme: { ...draft.theme, layout: option.value } }),
      })),
    [draft],
  );

  return (
    <div className={classes.layouts} role="radiogroup" aria-label="Layout">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          role="radio"
          aria-checked={option.value === current}
          className={classes.layoutOption}
          data-active={option.value === current || undefined}
          onClick={() => onChange(option.value)}
        >
          <PhoneThumb page={option.page} size="sm" className={classes.layoutThumb} />
          <span className={classes.optionLabel}>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
