import { Badge, Box, Switch } from "@mantine/core";
import { Section, Field } from "@/shared/ui/Page";
import type { BrandingForm } from "../hooks/useBrandingForm";
import classes from "./Branding.module.css";

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
    <Section
      title={`${defaultName} credits`}
      description="Small marks we add to your pages and images. Pro workspaces can switch them off."
      actions={!editable && <Badge variant="light" color="violet" size="sm">Pro</Badge>}
    >
      <Field
        label={`"${poweredByLabel}" footer`}
        hint="Appears under your public forms, on thank-you screens and in emails to respondents."
      >
        <Box className={classes.switchCell}>
          <Switch
            aria-label="Show powered-by footer"
            checked={showPoweredBy}
            onChange={(e) => setShowPoweredBy(e.currentTarget.checked)}
            disabled={locked}
            label={showPoweredBy ? "Shown" : "Hidden"}
            labelPosition="left"
          />
        </Box>
      </Field>
      <Field
        label="AI image watermark"
        hint="Marks images Orbit AI generates for you as AI-made."
        last
      >
        <Box className={classes.switchCell}>
          <Switch
            aria-label="Watermark AI images"
            checked={watermarkAiImages}
            onChange={(e) => setWatermarkAiImages(e.currentTarget.checked)}
            disabled={locked}
            label={watermarkAiImages ? "On" : "Off"}
            labelPosition="left"
          />
        </Box>
      </Field>
    </Section>
  );
}
