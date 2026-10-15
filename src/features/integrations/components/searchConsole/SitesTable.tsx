import { Text } from "@mantine/core";
import type { Site } from "@/shared/types";
import { SiteLinkRow } from "./SiteLinkRow";
import classes from "./SearchConsole.module.css";

interface Props {
  workspaceId: string;
  sites: Site[];
  links: Map<string, string>;
  canManage: boolean;
}

export function SitesTable({ workspaceId, sites, links, canManage }: Props) {
  return (
    <div className={classes.table}>
      <div className={classes.tableHead}>
        <span>Website</span>
        <span>Search Console property</span>
        <span />
      </div>
      {sites.length === 0 ? (
        <div className={classes.empty}>
          <Text size="sm" fw={600}>
            No websites in this workspace yet
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Add a website first, then link it to its Search Console property here.
          </Text>
        </div>
      ) : (
        sites.map((site) => (
          <SiteLinkRow
            key={site._id}
            workspaceId={workspaceId}
            site={site}
            propertyUrl={links.get(site._id)}
            canManage={canManage}
          />
        ))
      )}
    </div>
  );
}
