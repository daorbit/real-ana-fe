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

export function BrandingPreview({ form }: { form: BrandingForm }) {
  const [surface, setSurface] = useState<PreviewSurface>("form");

  const ownName = form.name.trim();
  const ownLogo = form.logoBroken ? "" : form.logoUrl.trim();
  const hasHeader = form.editable && Boolean(ownName || ownLogo);
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
        {surface === "form" ? (
          <FormMock
            header={hasHeader ? { name: ownName, logo: ownLogo } : null}
            showPoweredBy={form.showPoweredBy}
            poweredByLabel={form.poweredByLabel}
          />
        ) : (
          <PaymentMock
            name={ownName || form.defaultName}
            logo={ownLogo || form.defaultLogo}
          />
        )}
      </Box>
      {surface === "form" && !hasHeader && (
        <Text size="xs" c="dimmed">
          {form.editable
            ? "Add a name or logo to show it at the top of your forms."
            : "Forms show only the footer until you add your own brand on Pro."}
        </Text>
      )}
    </Box>
  );
}
