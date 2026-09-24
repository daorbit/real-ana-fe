import { Badge, ColorInput, TextInput } from "@mantine/core";
import { Section, Field } from "@/shared/ui/Page";
import { ACCENT_SWATCHES, DEFAULT_ACCENT } from "../constants";
import type { BrandingForm } from "../hooks/useBrandingForm";
import { LogoField } from "./LogoField";

export function IdentitySection({ form }: { form: BrandingForm }) {
  const { name, setName, accentColor, setAccentColor, locked, editable, defaultName } = form;

  return (
    <Section
      title="Your brand"
      description="How your business appears to people filling in your forms and paying through them."
      actions={!editable && <Badge variant="light" color="violet" size="sm">Pro</Badge>}
    >
      <Field
        label="Business name"
        hint={`Shown at the top of your forms and on the payment window. Leave empty to use "${defaultName}".`}
      >
        <TextInput
          placeholder={defaultName}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          disabled={locked}
          maxLength={60}
        />
      </Field>
      <Field
        label="Logo"
        hint="A square image works best. It sits next to your name on forms and payments."
      >
        <LogoField form={form} />
      </Field>
      <Field
        label="Brand colour"
        hint="Colours the submit button and the payment window header."
        last
      >
        <ColorInput
          placeholder={DEFAULT_ACCENT}
          value={accentColor}
          onChange={setAccentColor}
          disabled={locked}
          format="hex"
          swatches={ACCENT_SWATCHES}
          swatchesPerRow={10}
          withEyeDropper={false}
        />
      </Field>
    </Section>
  );
}
