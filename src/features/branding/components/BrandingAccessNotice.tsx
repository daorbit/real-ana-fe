import { Alert, Button, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { Lock, ShieldAlert } from "lucide-react";
import type { BrandingForm } from "../hooks/useBrandingForm";

export function BrandingAccessNotice({ form }: { form: BrandingForm }) {
  const { data, editable, canAdmin, defaultName } = form;
  if (!data) return null;

  if (!editable) {
    return (
      <Alert
        variant="light"
        color="violet"
        radius="md"
        icon={<Lock size={16} />}
        title="Custom branding is a Pro feature"
      >
        <Text size="sm">
          Right now your forms and payment windows show {defaultName}'s name and logo. Upgrade
          to Pro to use your own brand and remove the "{form.poweredByLabel}" footer.
        </Text>
        <Button component={Link} to="/app/billing" size="xs" variant="light" color="violet" mt="sm">
          See plans
        </Button>
      </Alert>
    );
  }

  if (!canAdmin) {
    return (
      <Alert variant="light" color="gray" radius="md" icon={<ShieldAlert size={16} />}>
        <Text size="sm">You can view branding, but only a workspace admin can change it.</Text>
      </Alert>
    );
  }

  return null;
}
