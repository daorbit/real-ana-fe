import { Text } from "@mantine/core";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { getFramework, frameworkLanguage } from "@/features/workspace/frameworks";
import type { Site } from "@/shared/types";
import type { AddSiteForm } from "./useAddSiteForm";
import { CreatedBanner, SiteIdRow, Task } from "./InstallParts";

export function WebInstallStep({ form, site, workspaceId }: { form: AddSiteForm; site: Site; workspaceId: string }) {
  const guide = getFramework(form.framework);

  return (
    <>
      <CreatedBanner title={`${site.name} was created`} hint="Two quick steps and data starts flowing in." />

      <Task n={1} title="Add the snippet to your site" hint={guide.placement}>
        <CodeBlock
          code={guide.code(site.siteId, form.options)}
          filename={guide.filename}
          language={frameworkLanguage(guide.id)}
        />
        {guide.note && (
          <Text size="xs" c="dimmed" mt="xs">
            {guide.note}
          </Text>
        )}
      </Task>

      <Task
        n={2}
        title="Verify the installation"
        hint="Deploy the change, open your site in a new tab, then run the check."
      >
        <InstallCheck workspaceId={workspaceId} siteId={site.siteId} domain={site.domain} />
      </Task>

      <SiteIdRow siteId={site.siteId} />
      <Text size="xs" c="dimmed" mt="xs">
        You can rebuild this snippet any time from the site's row. Your options are saved.
      </Text>
    </>
  );
}
