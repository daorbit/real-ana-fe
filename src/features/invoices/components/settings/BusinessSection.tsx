import { TextInput, Textarea } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { SettingsList, SettingsRow } from "./SettingsList";
import type { ProfileSectionProps } from "./sectionProps";
import classes from "./fields.module.css";

export function BusinessSection({ draft, setField }: ProfileSectionProps) {
  return (
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
        <SettingsRow label="GSTIN" hint="Optional. Turns the heading into Tax invoice.">
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
  );
}
