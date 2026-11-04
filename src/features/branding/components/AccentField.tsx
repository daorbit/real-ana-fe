import { Box, ColorInput, UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { ACCENT_SWATCHES, DEFAULT_ACCENT } from "../constants";
import type { BrandingForm } from "../hooks/useBrandingForm";
import classes from "./Branding.module.css";

export function AccentField({ form, id }: { form: BrandingForm; id: string }) {
  const { accentColor, setAccentColor, locked } = form;
  const current = (accentColor.trim() || DEFAULT_ACCENT).toLowerCase();

  return (
    <div className={classes.accent}>
      <div className={classes.swatches} role="group" aria-label="Brand colour presets">
        {ACCENT_SWATCHES.map((swatch) => {
          const selected = swatch.hex === current;
          return (
            <UnstyledButton
              key={swatch.hex}
              className={classes.swatch}
              __vars={{ "--swatch": swatch.hex }}
              aria-label={swatch.label}
              aria-pressed={selected}
              disabled={locked}
              onClick={() => setAccentColor(swatch.hex)}
            >
              {selected && <Check size={15} strokeWidth={3} />}
            </UnstyledButton>
          );
        })}
      </div>
      <ColorInput
        id={id}
        size="md"
        radius={12}
        classNames={{ input: classes.accentInput }}
        placeholder={DEFAULT_ACCENT}
        value={accentColor}
        onChange={setAccentColor}
        disabled={locked}
        format="hex"
        withPreview={false}
        withEyeDropper={false}
        leftSection={<Box className={classes.accentDot} __vars={{ "--swatch": current }} />}
      />
    </div>
  );
}
