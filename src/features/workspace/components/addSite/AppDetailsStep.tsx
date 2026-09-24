import { Box, SegmentedControl, Text, TextInput } from "@mantine/core";
import type { AppKind } from "./constants";
import type { AddSiteForm } from "./useAddSiteForm";
import classes from "./AddSiteWizard.module.css";

export function AppDetailsStep({ form }: { form: AddSiteForm }) {
  return (
    <Box className={classes.fields}>
      <div>
        <Text size="sm" fw={500} mb={6}>
          Is this a web app or a mobile app?
        </Text>
        <SegmentedControl
          value={form.appKind}
          onChange={(v) => form.setAppKind(v as AppKind)}
          data={[
            { label: "Web app", value: "web" },
            { label: "Mobile app", value: "mobile" },
          ]}
          fullWidth
        />
      </div>

      <TextInput
        label="App name"
        placeholder="Acme mobile"
        description="Only used to identify this app in your dashboard."
        value={form.name}
        onChange={(e) => form.setName(e.currentTarget.value)}
        error={form.nameError}
        data-autofocus
      />

      {form.appKind === "web" ? (
        <TextInput
          label="App URL"
          placeholder="app.yourcompany.com"
          description="Where the app is hosted."
          leftSection={<span className={classes.eyebrow}>https://</span>}
          leftSectionWidth={62}
          value={form.domain}
          onChange={(e) => form.setDomain(e.currentTarget.value)}
          error={form.domainError}
        />
      ) : (
        <TextInput
          label="Bundle ID or package name"
          placeholder="com.yourcompany.app"
          description="Optional. Helps you tell two apps apart at a glance."
          value={form.bundleId}
          onChange={(e) => form.setBundleId(e.currentTarget.value)}
        />
      )}
    </Box>
  );
}
