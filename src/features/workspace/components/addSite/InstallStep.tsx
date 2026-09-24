import { Text } from "@mantine/core";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { getFramework, frameworkLanguage } from "@/features/workspace/frameworks";
import { mobileSteps } from "@/features/workspace/mobileGuide";
import { API_ORIGIN } from "@/shared/lib/http";
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

export function AppInstallStep({ form, site }: { form: AddSiteForm; site: Site }) {
  return (
    <>
      <CreatedBanner
        title={`${site.name} was created`}
        hint="trace() posts to the Platform API with this site's id. No secret key is involved, so it's safe to ship inside the app."
      />

      {mobileSteps(site.siteId, API_ORIGIN, form.appKind).map((s, i) => (
        <Task key={s.id} n={i + 1} title={s.title} hint={s.blurb}>
          <CodeBlock code={s.code} filename={s.filename} language="tsx" />
          {s.note && (
            <Text size="xs" c="dimmed" mt="xs">
              {s.note}
            </Text>
          )}
        </Task>
      ))}

      <SiteIdRow siteId={site.siteId} />
      <Text size="xs" c="dimmed" mt="xs">
        The full mobile tracking guide is in Help → Documentation.
      </Text>
    </>
  );
}
