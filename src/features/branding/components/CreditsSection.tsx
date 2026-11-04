import { Badge, Switch } from "@mantine/core";
import type { BrandingForm } from "../hooks/useBrandingForm";
import { BrandingGroup } from "./BrandingGroup";
import classes from "./Branding.module.css";

function CreditRow({
  label,
  hint,
  ariaLabel,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  ariaLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className={classes.creditRow}>
      <div className={classes.creditText}>
        <div className={classes.rowLabel}>{label}</div>
        <div className={classes.rowHint}>{hint}</div>
      </div>
      <Switch
        size="md"
        aria-label={ariaLabel}
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        disabled={disabled}
      />
    </div>
  );
}

export function CreditsSection({ form }: { form: BrandingForm }) {
  const {
    showPoweredBy,
    setShowPoweredBy,
    watermarkAiImages,
    setWatermarkAiImages,
    poweredByLabel,
    locked,
    editable,
    defaultName,
  } = form;

  return (
    <BrandingGroup
      title={`${defaultName} credits`}
      description="Small marks on your pages and images. Pro workspaces can switch them off."
      actions={!editable && <Badge variant="light" color="violet" size="sm">Pro</Badge>}
    >
      <CreditRow
        label={`"${poweredByLabel}" footer`}
        hint="Appears under public forms, on thank-you screens and in emails to respondents."
        ariaLabel="Show powered-by footer"
        checked={showPoweredBy}
        onChange={setShowPoweredBy}
        disabled={locked}
      />
      <CreditRow
        label="AI image watermark"
        hint="Marks images Orbit AI generates for you as AI-made."
        ariaLabel="Watermark AI images"
        checked={watermarkAiImages}
        onChange={setWatermarkAiImages}
        disabled={locked}
      />
    </BrandingGroup>
  );
}
