import { NumberInput, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useInvoicingProfileDraft } from "../hooks/useInvoicingProfileDraft";
import { INVOICE_CURRENCIES, MAX_PAYMENT_TERMS_DAYS } from "../lib/invoicingOptions";
import classes from "./InvoicingSettings.module.css";

export function InvoicingSettings({ workspaceId }: { workspaceId: string }) {
  const { draft, setField, complete, loading, failed } = useInvoicingProfileDraft(workspaceId);

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={200} radius="md" />
        <Skeleton height={140} radius="md" />
      </Stack>
    );
  }

  if (failed || !draft) {
    return <Text className={classes.hint}>Business details could not be loaded. Close this and try again.</Text>;
  }

  return (
    <div className={classes.root}>
      {!complete && (
        <Text className={classes.hint}>
          Add your business details to start invoicing. They appear on every quotation and invoice you send.
        </Text>
      )}

      <section className={classes.section}>
        <span className={classes.label}>Business</span>
        <TextInput
          label="Business name"
          required
          value={draft.businessName}
          onChange={(e) => setField("businessName", e.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            label="Billing email"
            type="email"
            required
            value={draft.email}
            onChange={(e) => setField("email", e.currentTarget.value)}
          />
          <TextInput label="Phone" value={draft.phone} onChange={(e) => setField("phone", e.currentTarget.value)} />
        </SimpleGrid>
        <Textarea
          label="Address"
          required
          autosize
          minRows={2}
          value={draft.address}
          onChange={(e) => setField("address", e.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            label="GSTIN"
            description="Optional. Printed on invoices for Indian GST."
            maxLength={15}
            value={draft.gstin}
            onChange={(e) => setField("gstin", e.currentTarget.value.toUpperCase())}
          />
          <TextInput label="Website" value={draft.website} onChange={(e) => setField("website", e.currentTarget.value)} />
        </SimpleGrid>
      </section>

      <section className={classes.section}>
        <span className={classes.label}>Numbering and payment</span>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Select
            label="Currency"
            data={INVOICE_CURRENCIES}
            allowDeselect={false}
            value={draft.currency}
            onChange={(value) => value && setField("currency", value)}
          />
          <NumberInput
            label="Payment due after"
            suffix=" days"
            min={0}
            max={MAX_PAYMENT_TERMS_DAYS}
            allowDecimal={false}
            value={draft.paymentTermsDays}
            onChange={(value) => setField("paymentTermsDays", typeof value === "number" ? value : 0)}
          />
          <TextInput
            label="Invoice prefix"
            description="Invoices are numbered like INV-0001."
            maxLength={10}
            value={draft.invoicePrefix}
            onChange={(e) => setField("invoicePrefix", e.currentTarget.value.toUpperCase())}
          />
          <TextInput
            label="Quotation prefix"
            description="Quotations are numbered like QUO-0001."
            maxLength={10}
            value={draft.quotationPrefix}
            onChange={(e) => setField("quotationPrefix", e.currentTarget.value.toUpperCase())}
          />
        </SimpleGrid>
      </section>

      <section className={classes.section}>
        <span className={classes.label}>Defaults</span>
        <Textarea
          label="Notes"
          description="Added to new quotations and invoices. You can change it on each one."
          autosize
          minRows={2}
          value={draft.defaultNotes}
          onChange={(e) => setField("defaultNotes", e.currentTarget.value)}
        />
        <Textarea
          label="Terms"
          autosize
          minRows={2}
          value={draft.defaultTerms}
          onChange={(e) => setField("defaultTerms", e.currentTarget.value)}
        />
      </section>
    </div>
  );
}
