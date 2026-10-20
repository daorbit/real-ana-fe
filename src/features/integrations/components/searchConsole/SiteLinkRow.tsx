import { useState } from "react";
import { Button, Text } from "@mantine/core";
import { Link2 } from "lucide-react";
import { useUnlinkSearchConsolePropertyMutation } from "@/app/store";
import { propertyLabel } from "@/features/searchConsole/searchMetrics";
import { errMessage, notify } from "@/shared/lib/notify";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { Site } from "@/shared/types";
import { PropertyChooser } from "./PropertyChooser";
import classes from "./SearchConsole.module.css";

interface Props {
  workspaceId: string;
  site: Site;
  propertyUrl?: string;
  canManage: boolean;
}

export function SiteLinkRow({ workspaceId, site, propertyUrl, canManage }: Props) {
  const [choosing, setChoosing] = useState(false);
  const [unlink, { isLoading: unlinking }] = useUnlinkSearchConsolePropertyMutation();
  const linked = Boolean(propertyUrl);

  const remove = async () => {
    try {
      await unlink({ workspaceId, siteId: site._id }).unwrap();
      notify.info(`${site.name} unlinked from Search Console`);
    } catch (e) {
      notify.error(errMessage(e, "Could not unlink the property."));
    }
  };

  return (
    <div className={classes.rowWrap}>
      <div className={classes.row}>
        <div className={classes.site}>
          <SiteFavicon domain={site.domain} framework={site.framework} logoUrl={site.logoUrl} size={22} />
          <div className={classes.siteText}>
            <Text size="sm" fw={600} truncate>
              {site.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {site.domain}
            </Text>
          </div>
        </div>

        <div className={classes.property}>
          <span className={classes.dot} data-linked={linked} aria-hidden />
          {linked ? (
            <span className={classes.propertyText}>{propertyLabel(propertyUrl!)}</span>
          ) : (
            <Text size="sm" c="dimmed">
              Not linked yet
            </Text>
          )}
        </div>

        <div className={classes.actions}>
          {canManage &&
            !choosing &&
            (linked ? (
              <>
                <Button type="button" size="compact-sm" variant="default" onClick={() => setChoosing(true)}>
                  Change
                </Button>
                <Button
                  type="button"
                  size="compact-sm"
                  variant="subtle"
                  color="gray"
                  loading={unlinking}
                  onClick={() => void remove()}
                >
                  Unlink
                </Button>
              </>
            ) : (
              <Button type="button" size="compact-sm" leftSection={<Link2 size={14} />} onClick={() => setChoosing(true)}>
                Link property
              </Button>
            ))}
        </div>
      </div>

      {choosing && (
        <PropertyChooser
          workspaceId={workspaceId}
          siteId={site._id}
          current={propertyUrl}
          onDone={() => setChoosing(false)}
        />
      )}
    </div>
  );
}
