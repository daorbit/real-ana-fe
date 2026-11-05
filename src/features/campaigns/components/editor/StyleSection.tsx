import { Button, ColorInput, Select, Slider, Text } from "@mantine/core";
import { THEME_PRESETS } from "@/features/campaigns/lib/emailDesign";
import type { EmailFont, EmailTheme } from "@/features/campaigns/types";
import { EditorSection } from "./EditorSection";
import classes from "./Editor.module.css";

const COLORS: { key: keyof EmailTheme; label: string }[] = [
  { key: "pageColor", label: "Background" },
  { key: "cardColor", label: "Email" },
  { key: "headingColor", label: "Headings" },
  { key: "textColor", label: "Text" },
  { key: "accentColor", label: "Buttons and links" },
  { key: "buttonTextColor", label: "Button text" },
];

const FONTS: { value: EmailFont; label: string }[] = [
  { value: "sans", label: "System" },
  { value: "rounded", label: "Rounded" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

interface Props {
  theme: EmailTheme;
  onChange: (patch: Partial<EmailTheme>) => void;
}

export function StyleSection({ theme, onChange }: Props) {
  return (
    <EditorSection title="Style">
      <div className={classes.panelBody}>
        <div className={classes.presets}>
          {THEME_PRESETS.map((preset) => (
            <Button key={preset.id} variant="default" size="xs" onClick={() => onChange(preset.theme)}>
              {preset.label}
            </Button>
          ))}
        </div>
        <Select
          label="Font"
          data={FONTS}
          value={theme.font}
          allowDeselect={false}
          onChange={(font) => font && onChange({ font: font as EmailFont })}
        />
        <div className={classes.colors}>
          {COLORS.map(({ key, label }) => (
            <ColorInput
              key={key}
              label={label}
              format="hex"
              withEyeDropper={false}
              value={String(theme[key])}
              onChange={(value) => onChange({ [key]: value })}
            />
          ))}
        </div>
        <div>
          <Text size="sm" fw={500} mb={6}>Email width: {theme.width} px</Text>
          <Slider min={420} max={720} step={10} label={null} value={theme.width} onChange={(width) => onChange({ width })} aria-label="Email width" />
        </div>
        <div>
          <Text size="sm" fw={500} mb={6}>Corner radius: {theme.radius} px</Text>
          <Slider min={0} max={32} label={null} value={theme.radius} onChange={(radius) => onChange({ radius })} aria-label="Corner radius" />
        </div>
      </div>
    </EditorSection>
  );
}
