import { UnstyledButton } from "@mantine/core";
import { isSiteVerified } from "@/features/workspace/setupState";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import classes from "./Install.module.css";

export function InstallSitePicker({
  sites,
  selectedId,
  onPick,
}: {
  sites: Site[];
  selectedId: string;
  onPick: (siteId: string) => void;
}) {
  return (
    <div className={classes.picker} role="tablist">
      {sites.map((site) => {
        const selected = site.siteId === selectedId;
        return (
          <UnstyledButton
            key={site.siteId}
            role="tab"
            aria-selected={selected}
            data-selected={selected || undefined}
            className={classes.pick}
            onClick={() => onPick(site.siteId)}
          >
            <SiteFavicon domain={site.domain} framework={site.framework} size={16} />
            <span className={classes.pickName}>{site.name}</span>
            <span className={classes.statusDot} data-live={isSiteVerified(site) || undefined} />
          </UnstyledButton>
        );
      })}
    </div>
  );
}
