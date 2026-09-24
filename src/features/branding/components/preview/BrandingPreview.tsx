import { useState } from "react";
import { Box, SegmentedControl, Text } from "@mantine/core";
import { DEFAULT_ACCENT, type PreviewSurface } from "../../constants";
import type { BrandingForm } from "../../hooks/useBrandingForm";
import { FormMock } from "./FormMock";
import { PaymentMock } from "./PaymentMock";
import classes from "./BrandingPreview.module.css";

const SURFACES = [
  { value: "form", label: "Form" },
  { value: "payment", label: "Payment window" },
];

const ADDRESS: Record<PreviewSurface, string> = {
  form: "Your public form",
  payment: "Checkout",
};

export function BrandingPreview({ form }: { form: BrandingForm }) {
  const [surface, setSurface] = useState<PreviewSurface>("form");

  const name = form.name.trim() || form.defaultName;
  const logo = (!form.logoBroken && form.logoUrl.trim()) || form.defaultLogo;
  const accent = form.accentColor.trim() || DEFAULT_ACCENT;

  return (
    <Box className={`surface-card ${classes.card}`}>
      <Box>
        <Text fw={650} size="sm">Live preview</Text>
        <Text size="xs" c="dimmed">Updates as you edit.</Text>
      </Box>
      <SegmentedControl
        fullWidth
        size="xs"
        value={surface}
        onChange={(v) => setSurface(v as PreviewSurface)}
        data={SURFACES}
      />
      <Box className={classes.window} __vars={{ "--brand-accent": accent }}>
        <Box className={classes.chrome}>
          <span className={classes.dot} />
          <span className={classes.dot} />
          <span className={classes.dot} />
          <span className={classes.address}>{ADDRESS[surface]}</span>
        </Box>
        {surface === "form" ? (
          <FormMock
            name={name}
            logo={logo}
            showPoweredBy={form.showPoweredBy}
            poweredByLabel={form.poweredByLabel}
          />
        ) : (
          <PaymentMock name={name} logo={logo} />
        )}
      </Box>
    </Box>
  );
}
