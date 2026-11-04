import { Badge, TextInput } from "@mantine/core";
import type { BrandingForm } from "../hooks/useBrandingForm";
import { AccentField } from "./AccentField";
import { BrandingGroup, BrandingRow } from "./BrandingGroup";
import { LogoField } from "./LogoField";

export function IdentitySection({ form }: { form: BrandingForm }) {
  const { name, setName, locked, editable, defaultName } = form;

  return (
    <BrandingGroup
      title="Your brand"
      actions={!editable && <Badge variant="light" color="violet" size="sm">Pro</Badge>}
    >
      <LogoField form={form} />
      <BrandingRow
        label="Business name"
        htmlFor="brand-name"
        hint="Shown at the top of your forms and on the payment window."
      >
        <TextInput
          id="brand-name"
          size="md"
          radius={12}
          placeholder={defaultName}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          disabled={locked}
          maxLength={60}
        />
      </BrandingRow>
      <BrandingRow
        label="Brand colour"
        htmlFor="brand-colour"
        hint="Colours the payment window. Each form keeps its own theme colours."
      >
        <AccentField form={form} id="brand-colour" />
      </BrandingRow>
    </BrandingGroup>
  );
}
