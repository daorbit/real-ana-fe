import { BIO_ACCENTS, BIO_BACKGROUNDS, BIO_BUTTON_STYLES } from "@/features/bio/lib/bioOptions";
import type { BioPageInput, BioTheme } from "@/features/bio/types";
import { FontPicker } from "./FontPicker";
import { LayoutPicker } from "./LayoutPicker";
import { Card, CardSection } from "./ui/Card";
import { Segmented } from "./ui/Segmented";
import editor from "./Editor.module.css";
import classes from "./Design.module.css";

const MODES: { value: BioTheme["appearance"]; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function SettingRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className={classes.settingRow}>
      <span className={classes.settingLabel}>{label}</span>
      <Segmented size="sm" label={label} value={value} options={options} onChange={onChange} />
    </div>
  );
}

export function DesignPanel({ draft, onChange }: { draft: BioPageInput; onChange: (patch: Partial<BioTheme>) => void }) {
  const { theme } = draft;
  const custom = !BIO_ACCENTS.includes(theme.accent);

  return (
    <>
      <CardSection title="Layout">
        <Card>
          <LayoutPicker draft={draft} onChange={(layout) => onChange({ layout })} />
        </Card>
      </CardSection>

      <CardSection title="Font">
        <Card>
          <FontPicker value={theme.font} onChange={(font) => onChange({ font })} />
        </Card>
      </CardSection>

      <CardSection title="Colour">
        <Card padded={false}>
          <div className={`${editor.groupPad} ${classes.swatches}`}>
            {BIO_ACCENTS.map((accent) => (
              <button
                key={accent}
                type="button"
                className={classes.swatch}
                data-active={theme.accent === accent || undefined}
                aria-label={`Use ${accent}`}
                aria-pressed={theme.accent === accent}
                onClick={() => onChange({ accent })}
              >
                <span className={classes.swatchDot} data-color={accent} />
              </button>
            ))}
            <label className={classes.swatch} data-active={custom || undefined} aria-label="Custom colour">
              <input
                type="color"
                className={classes.colorInput}
                value={theme.accent}
                onChange={(e) => onChange({ accent: e.currentTarget.value.toLowerCase() })}
              />
            </label>
          </div>
          <SettingRow label="Mode" value={theme.appearance} options={MODES} onChange={(appearance) => onChange({ appearance })} />
          <SettingRow label="Background" value={theme.background} options={BIO_BACKGROUNDS} onChange={(background) => onChange({ background })} />
          <SettingRow label="Buttons" value={theme.buttonStyle} options={BIO_BUTTON_STYLES} onChange={(buttonStyle) => onChange({ buttonStyle })} />
        </Card>
      </CardSection>
    </>
  );
}
