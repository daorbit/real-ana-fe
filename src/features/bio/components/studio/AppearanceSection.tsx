import { ColorInput, ColorSwatch, SegmentedControl, UnstyledButton } from "@mantine/core";
import { BIO_ACCENTS, BIO_BUTTON_STYLES } from "@/features/bio/lib/bioOptions";
import type { BioTheme } from "@/features/bio/types";
import { StudioCard } from "./StudioCard";
import classes from "./BioStudio.module.css";

export function AppearanceSection({ theme, onChange }: { theme: BioTheme; onChange: (patch: Partial<BioTheme>) => void }) {
  return (
    <StudioCard title="Appearance" description="Your page keeps this look whatever theme the visitor's phone uses.">
      <div>
        <div className={classes.fieldLabel}>Background</div>
        <SegmentedControl
          value={theme.appearance}
          onChange={(value) => onChange({ appearance: value as BioTheme["appearance"] })}
          data={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </div>

      <div>
        <div className={classes.fieldLabel}>Button colour</div>
        <div className={classes.swatches}>
          {BIO_ACCENTS.map((accent) => (
            <UnstyledButton
              key={accent}
              className={classes.swatch}
              data-active={theme.accent === accent || undefined}
              aria-label={`Use ${accent}`}
              onClick={() => onChange({ accent })}
            >
              <ColorSwatch color={accent} size={24} withShadow={false} />
            </UnstyledButton>
          ))}
          <ColorInput
            size="xs"
            w={130}
            aria-label="Custom colour"
            format="hex"
            value={theme.accent}
            onChange={(value) => /^#[0-9a-f]{6}$/i.test(value) && onChange({ accent: value.toLowerCase() })}
          />
        </div>
      </div>

      <div>
        <div className={classes.fieldLabel}>Button shape</div>
        <SegmentedControl
          value={theme.buttonStyle}
          onChange={(value) => onChange({ buttonStyle: value as BioTheme["buttonStyle"] })}
          data={BIO_BUTTON_STYLES}
        />
      </div>
    </StudioCard>
  );
}
