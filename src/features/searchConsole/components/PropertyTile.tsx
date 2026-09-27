import { Radio, Text } from "@mantine/core";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { SearchConsolePropertyOption } from "@/shared/types";
import { propertyLabel } from "../searchMetrics";
import classes from "./picker.module.css";

const PERMISSION_LABEL: Record<string, string> = {
  siteOwner: "Owner",
  siteFullUser: "Full access",
  siteRestrictedUser: "Restricted",
};

export function PropertyTile({
  property,
  recommended = false,
}: {
  property: SearchConsolePropertyOption;
  recommended?: boolean;
}) {
  const isDomain = property.propertyUrl.startsWith("sc-domain:");
  const label = propertyLabel(property.propertyUrl);

  return (
    <Radio.Card value={property.propertyUrl} className={classes.tile} data-mismatch={!property.matches || undefined}>
      <div className={classes.tileTop}>
        <span className={classes.favicon}>
          <SiteFavicon domain={label.split("/")[0]} size={22} />
        </span>
        <Radio.Indicator className={classes.indicator} />
      </div>
      <Text className={classes.tileName} title={label}>
        {label}
      </Text>
      <Text size="xs" c="dimmed">
        {isDomain ? "Domain property" : "URL-prefix property"} ·{" "}
        {PERMISSION_LABEL[property.permissionLevel] ?? property.permissionLevel}
      </Text>
      <div className={classes.tileBadges}>
        {recommended && <span className={classes.recommended}>Best match</span>}
        {property.matches && !recommended && <span className={classes.match}>Matches this site</span>}
        {!property.matches && <span className={classes.mismatch}>Different domain</span>}
      </div>
    </Radio.Card>
  );
}
