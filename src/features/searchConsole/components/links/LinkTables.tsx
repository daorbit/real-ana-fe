import { Pill } from "@/features/seo/components/shared/Pill";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { BacklinkOverview, LinkProfile } from "@/features/backlinks/types";
import { ANCHOR_LABEL, SOURCE_LABEL } from "@/features/backlinks/utils/labels";
import { SearchCountTable } from "../SearchCountTable";
import layout from "../searchConsole.module.css";
import classes from "./links.module.css";

export function LinkTables({
  profile,
  pages,
}: {
  profile: LinkProfile;
  pages: NonNullable<BacklinkOverview["topPages"]>;
}) {
  return (
    <>
      <SearchCountTable
        title="Top linked pages"
        description="Your pages that other sites link to most."
        labelHeader="Page"
        valueHeaders={["Linking sites", "Links"]}
        emptyText="No live links confirmed yet."
        rows={pages.map((page) => ({
          key: page.path,
          label: page.path,
          title: page.url,
          values: [page.domains.toLocaleString(), page.links.toLocaleString()],
        }))}
      />
      <div className={layout.tables}>
        <SearchCountTable
          title="Top linking sites"
          description="The sites with the most links to you."
          labelHeader="Site"
          valueHeaders={["Type", "Links"]}
          emptyText="No live links confirmed yet."
          rows={profile.topDomains.map((domain) => ({
            key: domain.domain,
            label: (
              <span className={classes.site}>
                <SiteFavicon domain={domain.domain} size={16} />
                {domain.domain}
              </span>
            ),
            title: domain.domain,
            values: [<Pill key="kind">{SOURCE_LABEL[domain.kind]}</Pill>, domain.links.toLocaleString()],
          }))}
        />
        <SearchCountTable
          title="Top linking text"
          description="The words other sites use when they link to you."
          labelHeader="Text"
          valueHeaders={["Type", "Links"]}
          emptyText="No text links confirmed yet."
          rows={profile.topAnchors.map((anchor) => ({
            key: anchor.text,
            label: anchor.text,
            title: anchor.text,
            values: [<Pill key="kind">{ANCHOR_LABEL[anchor.kind]}</Pill>, anchor.count.toLocaleString()],
          }))}
        />
      </div>
    </>
  );
}
