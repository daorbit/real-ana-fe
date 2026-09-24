import { IdentityCard } from "./IdentityCard";
import { ProfileFields } from "./ProfileFields";
import { DateTimeFields } from "./DateTimeFields";
import { SaveBarSpacer, SettingsStack } from "./SettingsCard";
import type { ProfileForm } from "./useProfileForm";

export function InfoPanel({ form }: { form: ProfileForm }) {
  return (
    <SettingsStack>
      <IdentityCard form={form} />
      <ProfileFields form={form} />
      <DateTimeFields form={form} />
      {form.dirty && <SaveBarSpacer />}
    </SettingsStack>
  );
}
