import { Button, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import type { FrameworkId } from "@/features/workspace/frameworks";
 
export const SITE_PURPOSES = [
  "Company website", "Blog", "SaaS product", "E-commerce store",
  "Marketing site", "Portfolio", "Documentation", "Landing page",
  "Internal tool", "Other",
];

export function SiteStepBody({
  siteName,
  siteError,
  onSiteNameChange,
  domain,
  domainError,
  onDomainChange,
  purpose,
  onPurposeChange,
  framework,
  onFrameworkChange,
}: {
  siteName: string;
  siteError: string | null;
  onSiteNameChange: (v: string) => void;
  domain: string;
  domainError: string | null;
  onDomainChange: (v: string) => void;
  purpose: string;
  onPurposeChange: (v: string) => void;
  framework: FrameworkId;
  onFrameworkChange: (v: FrameworkId) => void;
}) {
  return (
    <Stack gap="xl">
      <div>
        <Title order={2} style={{ letterSpacing: "-0.02em" }}>
          Add your first site
        </Title>
        <Text c="dimmed" size="sm" mt={8}>
          Tell us what you&apos;re tracking and what it&apos;s built with —
          we&apos;ll tailor the install instructions.
        </Text>
      </div>

      <TextInput
        size="md"
        label="Site name"
        placeholder="Marketing site"
        value={siteName}
        error={siteError}
        onChange={(e) => onSiteNameChange(e.currentTarget.value)}
        data-autofocus
      />

      <TextInput
        size="md"
        label="Domain"
        placeholder="example.com"
        leftSection={<Globe size={15} />}
        value={domain}
        error={domainError}
        onChange={(e) => onDomainChange(e.currentTarget.value)}
      />

      <Select
        size="md"
        label="What's this site for?"
        description="Optional — helps us tailor the next screen"
        placeholder="Choose one"
        data={SITE_PURPOSES}
        value={purpose || null}
        onChange={(v) => onPurposeChange(v ?? "")}
        clearable
      />

      <div>
        <Text size="sm" fw={500} mb={2}>
          What is it built with?
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Only changes the install snippet you get next.
        </Text>
        <FrameworkPicker value={framework} onChange={onFrameworkChange} />
      </div>
    </Stack>
  );
}

export function SiteStepFooter({
  loading,
  onBack,
  onSubmit,
}: {
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <Group grow>
      <Button
        className="auth-btn"
        size="md"
        variant="default"
        leftSection={<ArrowLeft size={15} />}
        onClick={onBack}
      >
        Back
      </Button>
      <Button
        className="auth-btn"
        size="md"
        loading={loading}
        onClick={onSubmit}
        rightSection={<ArrowRight size={16} />}
      >
        Continue
      </Button>
    </Group>
  );
}
