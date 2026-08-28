import { Box, Stack } from "@mantine/core";
import { IdentityCard } from "./IdentityCard";
import { ProfileFields } from "./ProfileFields";
import { DateTimeFields } from "./DateTimeFields";
import type { ProfileForm } from "./useProfileForm";

export function InfoPanel({ form }: { form: ProfileForm }) {
  return (
    <Box className="settings-info-grid">
      <Stack gap="xl" className="settings-info-main">
        <IdentityCard form={form} />
        <ProfileFields form={form} />
      </Stack>

      <Box className="settings-info-aside">
        <DateTimeFields form={form} />
      </Box>

      {form.dirty && <Box h={64} aria-hidden style={{ gridColumn: "1 / -1" }} />}
    </Box>
  );
}
