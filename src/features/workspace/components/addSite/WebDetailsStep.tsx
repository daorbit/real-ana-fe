import { SiteStepBody } from "@/features/auth/components/onboarding/SiteStep";
import type { AddSiteForm } from "./useAddSiteForm";

export function WebDetailsStep({ form }: { form: AddSiteForm }) {
  return (
    <SiteStepBody
      siteName={form.name}
      siteError={form.nameError}
      onSiteNameChange={form.setName}
      domain={form.domain}
      domainError={form.domainError}
      onDomainChange={form.setDomain}
      purpose={form.purpose}
      onPurposeChange={form.setPurpose}
      logoUrl={form.logoUrl}
      onLogoChange={form.setLogoUrl}
    />
  );
}
