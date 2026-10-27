import { Tooltip, UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { INVOICE_ACCENTS } from "../../lib/invoicingOptions";
import type { InvoiceAccent } from "../../types";
import classes from "./fields.module.css";

export function AccentPicker({ value, onChange }: { value: InvoiceAccent; onChange: (value: InvoiceAccent) => void }) {
  return (
    <div className={classes.swatches} role="radiogroup" aria-label="Colour">
      {INVOICE_ACCENTS.map((accent) => (
        <Tooltip key={accent.value} label={accent.label} withArrow>
          <UnstyledButton
            role="radio"
            aria-checked={value === accent.value}
            aria-label={accent.label}
            data-accent={accent.value}
            data-active={value === accent.value || undefined}
            className={classes.swatch}
            onClick={() => onChange(accent.value)}
          >
            {value === accent.value && <Check size={14} />}
          </UnstyledButton>
        </Tooltip>
      ))}
    </div>
  );
}
