import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import s from "./SiteStep.module.css";

export const SITE_PURPOSES = [
  "Company website", "Blog", "SaaS product", "E-commerce store",
  "Marketing site", "Portfolio", "Documentation", "Landing page",
  "Internal tool", "Other",
];

/**
 * The step that asks what is being tracked: name, domain, and what it's for.
 *
 * Framework used to live at the foot of this same step, as a second section
 * below these three fields — but a twenty-tile logo grid sharing a screen with
 * a name/domain form buried the grid below the fold and made the fields above
 * it read as a preamble to it rather than their own step. It now gets a
 * screen of its own, right after this one.
 */
export function SiteStepBody({
  siteName,
  siteError,
  onSiteNameChange,
  domain,
  domainError,
  onDomainChange,
  purpose,
  onPurposeChange,
}: {
  siteName: string;
  siteError: string | null;
  onSiteNameChange: (v: string) => void;
  domain: string;
  domainError: string | null;
  onDomainChange: (v: string) => void;
  purpose: string;
  onPurposeChange: (v: string) => void;
}) {
  return (
    <div className={s.root}>
      <section className={s.section}>
        <div className={s.fields}>
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
            placeholder="yoursite.com"
            leftSection={
              <Text size="sm" c="dimmed" style={{ pointerEvents: "none" }}>
                https://
              </Text>
            }
            leftSectionWidth={62}
            value={domain}
            error={domainError}
            onChange={(e) => onDomainChange(e.currentTarget.value)}
          />
        </div>

        <Select
          size="md"
          label="What's this site for?"
          description="Optional — we use it to tailor the next screens"
          placeholder="Choose one"
          data={SITE_PURPOSES}
          value={purpose || null}
          onChange={(v) => onPurposeChange(v ?? "")}
          clearable
          mt="md"
        />
      </section>
    </div>
  );
}

export function SiteStepFooter({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Button
        className="auth-btn"
        size="sm"
        variant="subtle"
        color="gray"
        leftSection={<ArrowLeft size={14} />}
        onClick={onBack}
      >
        Back
      </Button>
      <Button
        className="auth-btn"
        size="sm"
        onClick={onSubmit}
        rightSection={<ArrowRight size={15} />}
      >
        Continue
      </Button>
    </Group>
  );
}
