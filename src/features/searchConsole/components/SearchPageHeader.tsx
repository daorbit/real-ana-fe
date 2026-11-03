import type { ReactNode } from "react";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";

export function SearchPageHeader({ actions }: { actions?: ReactNode }) {
  return (
    <PageHeader
      title="Search visibility"
      description="How people find you on Google, straight from Search Console."
      docsPath={DOCS_SLUGS.searchVisibility}
      actions={actions}
    />
  );
}
