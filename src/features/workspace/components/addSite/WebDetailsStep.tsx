import { Box, TextInput } from "@mantine/core";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import type { AddSiteForm } from "./useAddSiteForm";
import classes from "./AddSiteWizard.module.css";

export function WebDetailsStep({ form }: { form: AddSiteForm }) {
  return (
    <>
      <Box className={classes.fields}>
        <TextInput
          label="Site name"
          placeholder="Marketing site"
          description="Only used to identify this site in your dashboard."
          value={form.name}
          onChange={(e) => form.setName(e.currentTarget.value)}
          error={form.nameError}
          data-autofocus
        />
        <TextInput
          label="Domain"
          placeholder="yoursite.com"
          description="The site you'll install the tracker on."
          leftSection={<span className={classes.eyebrow}>https://</span>}
          leftSectionWidth={62}
          value={form.domain}
          onChange={(e) => form.setDomain(e.currentTarget.value)}
          error={form.domainError}
        />
      </Box>

      <Box className={classes.section}>
        <div className={classes.sectionTitle}>What is it built with?</div>
        <p className={classes.sectionHint}>
          Only changes the install instructions you get at the end. The tracker is the same everywhere.
        </p>
        <FrameworkPicker value={form.framework} onChange={form.setFramework} />
      </Box>
    </>
  );
}
