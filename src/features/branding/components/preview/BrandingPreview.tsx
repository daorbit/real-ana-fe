import { useState } from "react";
import { Box, Text, UnstyledButton } from "@mantine/core";
import { DEFAULT_ACCENT, type PreviewSurface } from "../../constants";
import type { BrandingForm } from "../../hooks/useBrandingForm";
import { FormMock } from "./FormMock";
import { PaymentMock } from "./PaymentMock";
import classes from "./BrandingPreview.module.css";

const SURFACES: { value: PreviewSurface; label: string }[] = [
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
    <Box component="aside" className={classes.preview}>
      <div className={classes.head}>
        <h2 className={classes.title}>Live preview</h2>
        <div className={classes.tabs} role="group" aria-label="Preview surface">
          {SURFACES.map((item) => (
            <UnstyledButton
              key={item.value}
              className={classes.tab}
              data-active={surface === item.value || undefined}
              aria-pressed={surface === item.value}
              onClick={() => setSurface(item.value)}
            >
              {item.label}
            </UnstyledButton>
          ))}
        </div>
      </div>

      <Box className={classes.window} __vars={{ "--brand-accent": accent }}>
        {surface === "form" ? (
          <FormMock
            header={hasHeader ? { name: ownName, logo: ownLogo } : null}
            showPoweredBy={form.showPoweredBy}
            poweredByLabel={form.poweredByLabel}
          />
        ) : (
          <PaymentMock name={ownName || form.defaultName} logo={ownLogo || form.defaultLogo} />
        )}
        {surface === "form" && !hasHeader && (
          <Text size="xs" c="dimmed" ta="center" mt="sm">
            {form.editable
              ? "Add a name or logo to show it at the top of your forms."
              : "Forms show only the footer until you add your own brand on Pro."}
          </Text>
        )}
      </Box>
    </Box>
  );
}
