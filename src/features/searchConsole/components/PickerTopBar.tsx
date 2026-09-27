import { Anchor, Select } from "@mantine/core";
import { ArrowLeft, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetSitesQuery } from "@/app/store";
import { useSiteScope } from "@/features/analytics";
import classes from "./picker.module.css";

export function PickerTopBar({ workspaceId, siteId }: { workspaceId: string; siteId: string }) {
  const { currentData: sites = [] } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const [, setSiteScope] = useSiteScope(workspaceId || undefined);
  const webSites = sites.filter((s) => s.platform !== "app");

  return (
    <div className={classes.topBar}>
      <Anchor component={Link} to="/app" size="sm" c="dimmed" className={classes.back}>
        <ArrowLeft size={14} /> Back to dashboard
      </Anchor>
      {webSites.length > 1 && (
        <Select
          size="xs"
          className={classes.siteSwitch}
          aria-label="Choose a site"
          leftSection={<Globe size={13} />}
          data={webSites.map((s) => ({ value: s.siteId, label: s.name }))}
          value={siteId}
          onChange={(v) => v && setSiteScope([v])}
          allowDeselect={false}
        />
      )}
    </div>
  );
}
