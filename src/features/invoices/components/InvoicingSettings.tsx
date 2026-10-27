import { NumberInput, Select, Skeleton, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { useInvoicingProfileDraft } from "../hooks/useInvoicingProfileDraft";
import { INVOICE_CURRENCIES, MAX_PAYMENT_TERMS_DAYS } from "../lib/invoicingOptions";
import { SettingsList, SettingsRow } from "./settings/SettingsList";
import { SaveRow } from "./settings/SaveRow";
import classes from "./InvoicingSettings.module.css";

function sampleNumber(prefix: string, fallback: string): string {
  return `${prefix.trim() || fallback}-0001`;
}

export function InvoicingSettings({ workspaceId }: { workspaceId: string }) {
  const profile = useInvoicingProfileDraft(workspaceId);
  const { draft, setField } = profile;

  if (profile.loading) {
    return (
      <Stack gap="lg">
        <Skeleton height={260} radius="md" />
        <Skeleton height={180} radius="md" />
      </Stack>
    );
  }

  if (profile.failed || !draft) {
    return <Text className={classes.error}>Business details could not be loaded. Close this and try again.</Text>;
  }

  return (
    <div className={classes.root}>
      <StudioSection title="Your business" description="Printed at the top of every quotation and invoice you send.">
        <SettingsList>
          <SettingsRow label="Business name" required>
            <TextInput
              aria-label="Business name"
              placeholder="Acme Studio"
              value={draft.businessName}
              onChange={(e) => setField("businessName", e.currentTarget.value)}
            />
          </SettingsRow>
          <SettingsRow label="Billing email" required hint="Clients reply to this address.">
            <TextInput
              aria-label="Billing email"
              type="email"
              placeholder="billing@acme.com"
              value={draft.email}
              onChange={(e) => setField("email", e.currentTarget.value)}
            />
          </SettingsRow>
          <SettingsRow label="Phone">
            <TextInput
              aria-label="Phone"
              placeholder="+91 98765 43210"
              value={draft.phone}
              onChange={(e) => setField("phone", e.currentTarget.value)}
            />
          </SettingsRow>
          <SettingsRow label="Address" required alignTop>
            <Textarea
              aria-label="Address"
              placeholder={"Street, city\nState, PIN code"}
              autosize
              minRows={2}
              value={draft.address}
              onChange={(e) => setField("address", e.currentTarget.value)}
            />
          </SettingsRow>
          <SettingsRow label="GSTIN" hint="Optional. Shown under your address.">
            <TextInput
              aria-label="GSTIN"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              className={classes.short}
              value={draft.gstin}
              onChange={(e) => setField("gstin", e.currentTarget.value.toUpperCase())}
            />
          </SettingsRow>
          <SettingsRow label="Website">
            <TextInput
              aria-label="Website"
              placeholder="acme.com"
              value={draft.website}
              onChange={(e) => setField("website", e.currentTarget.value)}
            />
          </SettingsRow>
        </SettingsList>
      </StudioSection>

      <StudioSection title="Numbers and payment" description="How new documents are numbered, priced and dated.">
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

      <StudioSection title="Defaults" description="Filled into every new document. You can change them on each one.">
        <SettingsList>
          <SettingsRow label="Notes" alignTop>
            <Textarea
              aria-label="Default notes"
              placeholder="Thank you for your business."
              autosize
              minRows={2}
              value={draft.defaultNotes}
              onChange={(e) => setField("defaultNotes", e.currentTarget.value)}
            />
          </SettingsRow>
          <SettingsRow label="Terms" alignTop>
            <Textarea
              aria-label="Default terms"
              placeholder="Payment due within 30 days of the invoice date."
              autosize
              minRows={2}
              value={draft.defaultTerms}
              onChange={(e) => setField("defaultTerms", e.currentTarget.value)}
            />
          </SettingsRow>
        </SettingsList>
      </StudioSection>

      <SaveRow
        dirty={profile.dirty}
        saving={profile.saving}
        complete={profile.complete}
        onSave={() => void profile.save()}
        onDiscard={profile.discard}
      />
    </div>
  );
}
