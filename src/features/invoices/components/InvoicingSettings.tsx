import { Skeleton, Stack, Text } from "@mantine/core";
import { useInvoicingProfileDraft } from "../hooks/useInvoicingProfileDraft";
import { BusinessSection } from "./settings/BusinessSection";
import { StyleSection } from "./settings/StyleSection";
import { NumbersSection } from "./settings/NumbersSection";
import { PaymentSection } from "./settings/PaymentSection";
import { DefaultsSection } from "./settings/DefaultsSection";
import { SaveRow } from "./settings/SaveRow";
import classes from "./InvoicingSettings.module.css";

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
      <BusinessSection draft={draft} setField={setField} />
      <StyleSection draft={draft} setField={setField} />
      <NumbersSection draft={draft} setField={setField} />
      <PaymentSection draft={draft} setField={setField} />
      <DefaultsSection draft={draft} setField={setField} />
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
