import { NumberInput, Select, TextInput } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { INVOICE_CURRENCIES, MAX_PAYMENT_TERMS_DAYS } from "../../lib/invoicingOptions";
import { SettingsList, SettingsRow } from "./SettingsList";
import type { ProfileSectionProps } from "./sectionProps";
import classes from "./fields.module.css";

function sampleNumber(prefix: string, fallback: string): string {
  return `${prefix.trim() || fallback}-0001`;
}

export function NumbersSection({ draft, setField }: ProfileSectionProps) {
  return (
    <StudioSection title="Numbers and payment terms" description="How new documents are numbered, priced and dated.">
      <SettingsList>
        <SettingsRow label="Currency">
          <Select
            aria-label="Currency"
            data={INVOICE_CURRENCIES}
            allowDeselect={false}
            className={classes.short}
            value={draft.currency}
            onChange={(value) => value && setField("currency", value)}
          />
        </SettingsRow>
        <SettingsRow label="Payment due" hint="Sets the due date on new invoices.">
          <NumberInput
            aria-label="Payment due after"
            suffix=" days"
            min={0}
            max={MAX_PAYMENT_TERMS_DAYS}
            allowDecimal={false}
            className={classes.prefix}
            value={draft.paymentTermsDays}
            onChange={(value) => setField("paymentTermsDays", typeof value === "number" ? value : 0)}
          />
        </SettingsRow>
        <SettingsRow label="Invoice numbers" hint={`Next looks like ${sampleNumber(draft.invoicePrefix, "INV")}`}>
          <TextInput
            aria-label="Invoice prefix"
            maxLength={10}
            className={classes.prefix}
            value={draft.invoicePrefix}
            onChange={(e) => setField("invoicePrefix", e.currentTarget.value.toUpperCase())}
          />
        </SettingsRow>
        <SettingsRow label="Quotation numbers" hint={`Next looks like ${sampleNumber(draft.quotationPrefix, "QUO")}`}>
          <TextInput
            aria-label="Quotation prefix"
            maxLength={10}
            className={classes.prefix}
            value={draft.quotationPrefix}
            onChange={(e) => setField("quotationPrefix", e.currentTarget.value.toUpperCase())}
          />
        </SettingsRow>
      </SettingsList>
    </StudioSection>
  );
}
