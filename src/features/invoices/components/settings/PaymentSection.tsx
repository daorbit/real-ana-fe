import { TextInput } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { SettingsList, SettingsRow } from "./SettingsList";
import type { ProfileSectionProps } from "./sectionProps";
import classes from "./fields.module.css";

export function PaymentSection({ draft, setField }: ProfileSectionProps) {
  return (
    <StudioSection
      title="Payment details"
      description="Printed on every invoice so clients know where to pay. All optional."
    >
      <SettingsList>
        <SettingsRow label="Bank name">
          <TextInput
            aria-label="Bank name"
            placeholder="HDFC Bank"
            value={draft.bankName}
            onChange={(e) => setField("bankName", e.currentTarget.value)}
          />
        </SettingsRow>
        <SettingsRow label="Account name" hint="The name on the bank account.">
          <TextInput
            aria-label="Account name"
            placeholder="Acme Studio LLP"
            value={draft.accountName}
            onChange={(e) => setField("accountName", e.currentTarget.value)}
          />
        </SettingsRow>
        <SettingsRow label="Account number">
          <TextInput
            aria-label="Account number"
            placeholder="50100123456789"
            maxLength={34}
            className={classes.short}
            value={draft.accountNumber}
            onChange={(e) => setField("accountNumber", e.currentTarget.value.toUpperCase())}
          />
        </SettingsRow>
        <SettingsRow label="IFSC" hint="11 characters, for transfers within India.">
          <TextInput
            aria-label="IFSC"
            placeholder="HDFC0001234"
            maxLength={11}
            className={classes.short}
            value={draft.ifsc}
            onChange={(e) => setField("ifsc", e.currentTarget.value.toUpperCase())}
          />
        </SettingsRow>
        <SettingsRow label="UPI ID" hint="Adds a scan-to-pay QR code to rupee invoices.">
          <TextInput
            aria-label="UPI ID"
            placeholder="acme@okhdfcbank"
            className={classes.short}
            value={draft.upiId}
            onChange={(e) => setField("upiId", e.currentTarget.value.trim())}
          />
        </SettingsRow>
      </SettingsList>
    </StudioSection>
  );
}
