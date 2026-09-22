import { Button, Group, Select, Text, TextInput } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import type { FrameworkId } from "@/features/workspace/frameworks";
import s from "./SiteStep.module.css";

export const SITE_PURPOSES = [
  "Company website", "Blog", "SaaS product", "E-commerce store",
  "Marketing site", "Portfolio", "Documentation", "Landing page",
  "Internal tool", "Other",
];

/**
 * The step that asks what is being tracked.
 *
 * Two labelled sections rather than one run of four controls: the first three
 * fields describe the site, the fourth is a twenty-tile logo grid, and running
 * them together made the grid look like the answer to "what's this site for?".
 * Splitting them also lets the fields sit two-up while the grid keeps the full
 * width it needs.
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
    <div className={s.root}>
      <section className={s.section}>
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>About the site</h3>
        </div>

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

      <section className={s.section}>
        <div className={s.sectionHead}>
          <h3 className={s.sectionTitle}>Built with</h3>
          <p className={s.sectionNote}>
            Only changes the install snippet you get next — pick the closest
            match.
          </p>
        </div>

        <FrameworkPicker value={framework} onChange={onFrameworkChange} />
      </section>
    </div>
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
  // `sm`, not `md`: this footer is pinned to the bottom of the screen, and
  // every pixel it takes is a pixel of the picker above it.
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
        loading={loading}
        onClick={onSubmit}
        rightSection={<ArrowRight size={15} />}
      >
        Continue
      </Button>
    </Group>
  );
}
