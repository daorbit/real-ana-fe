import { useEffect, useState } from "react";
import { Alert, Anchor, Button, Collapse, Radio, Text, UnstyledButton } from "@mantine/core";
import { AlertTriangle, Check, ChevronDown, ExternalLink, Globe, Link2, RefreshCw } from "lucide-react";
import {
  useGetSearchConsolePropertiesQuery,
  useLinkSearchConsolePropertyMutation,
} from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import type { SearchConsolePropertyOption } from "@/shared/types";
import { propertyLabel } from "../searchMetrics";
import { PropertyPickerSkeleton } from "./SearchSkeletons";
import classes from "./picker.module.css";

const PERMISSION_LABEL: Record<string, string> = {
  siteOwner: "Owner",
  siteFullUser: "Full access",
  siteRestrictedUser: "Restricted",
};

function isDomainProperty(url: string) {
  return url.startsWith("sc-domain:");
}

function PropertyCard({ property, recommended }: { property: SearchConsolePropertyOption; recommended: boolean }) {
  const domain = isDomainProperty(property.propertyUrl);
  const Icon = domain ? Globe : Link2;
  return (
    <Radio.Card value={property.propertyUrl} className={classes.option}>
      <span className={classes.optionIcon}>
        <Icon size={16} />
      </span>
      <span className={classes.optionText}>
        <span className={classes.optionTitle}>
          <Text size="sm" fw={650} truncate>
            {propertyLabel(property.propertyUrl)}
          </Text>
          {recommended && <span className={classes.recommended}>Recommended</span>}
        </span>
        <Text size="xs" c="dimmed" truncate>
          {domain ? "Domain property · includes every subdomain" : "URL-prefix property"} ·{" "}
          {PERMISSION_LABEL[property.permissionLevel] ?? property.permissionLevel}
        </Text>
      </span>
      <Radio.Indicator className={classes.indicator} />
    </Radio.Card>
  );
}

function Stepper() {
  return (
    <ol className={classes.stepper}>
      <li data-done>
        <span className={classes.stepDot}>
          <Check size={11} strokeWidth={3} />
        </span>
        Google connected
      </li>
      <li className={classes.stepLine} aria-hidden />
      <li data-current>
        <span className={classes.stepDot}>2</span>
        Link property
      </li>
    </ol>
  );
}

export function SearchConsolePropertyPicker({
  workspaceId,
  siteId,
  googleEmail,
  onSwitchAccount,
  switching,
}: {
  workspaceId: string;
  siteId: string;
  googleEmail: string;
  onSwitchAccount: () => void;
  switching: boolean;
}) {
  const { data, isLoading, isFetching, error, refetch } = useGetSearchConsolePropertiesQuery({
    workspaceId,
    siteId,
  });
  const [link, { isLoading: linking }] = useLinkSearchConsolePropertyMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [showOthers, setShowOthers] = useState(false);

  const properties = data?.properties ?? [];
  const matching = properties.filter((p) => p.matches);
  const others = properties.filter((p) => !p.matches);
  const domain = data?.domain ?? "this site";

  useEffect(() => {
    setSelected(matching[0]?.propertyUrl ?? null);
  }, [data]);

  const save = async () => {
    if (!selected) return;
    try {
      await link({ workspaceId, siteId, propertyUrl: selected }).unwrap();
      notify.success("Search Console property linked");
    } catch (e) {
      notify.error(errMessage(e, "Could not link that property."));
    }
  };

  if (isLoading) return <PropertyPickerSkeleton />;

  if (error) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Could not load your Search Console properties.")}
      </Alert>
    );
  }

  return (
    <div className={classes.wrap}>
      <Stepper />

      <div className={classes.panel}>
        <div className={classes.account}>
          <GoogleMark size={16} />
          <span className={classes.accountEmail}>{googleEmail || "Google account"}</span>
          <UnstyledButton className={classes.switch} onClick={onSwitchAccount} disabled={switching}>
            Switch
          </UnstyledButton>
        </div>

        <div className={classes.head}>
          <Text className={classes.title}>Choose a property for {domain}</Text>
          <Text size="sm" c="dimmed">
            Quantalog will read search data for {domain} from this Search Console property.
          </Text>
        </div>

        {matching.length > 0 ? (
          <Radio.Group value={selected} onChange={setSelected}>
            <div className={classes.options}>
              {matching.map((p, i) => (
                <PropertyCard key={p.propertyUrl} property={p} recommended={i === 0 && matching.length > 1} />
              ))}
            </div>
          </Radio.Group>
        ) : (
          <div className={classes.empty}>
            <AlertTriangle size={18} />
            <Text size="sm" fw={600}>
              {properties.length ? `No property covers ${domain}` : "No Search Console properties yet"}
            </Text>
            <Text size="xs" c="dimmed">
              Add and verify {domain} in Search Console with this Google account, then refresh — or switch to the
              account that owns it.
            </Text>
            <Button
              variant="default"
              size="xs"
              mt={6}
              leftSection={<RefreshCw size={13} />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh list
            </Button>
          </div>
        )}

        {others.length > 0 && (
          <div className={classes.others}>
            <UnstyledButton className={classes.othersToggle} onClick={() => setShowOthers((v) => !v)}>
              {others.length} other propert{others.length === 1 ? "y" : "ies"} on this account don't cover {domain}
              <ChevronDown size={13} className={classes.chevron} data-open={showOthers || undefined} />
            </UnstyledButton>
            <Collapse expanded={showOthers}>
              <ul className={classes.othersList}>
                {others.map((p) => (
                  <li key={p.propertyUrl}>{propertyLabel(p.propertyUrl)}</li>
                ))}
              </ul>
            </Collapse>
          </div>
        )}

        {matching.length > 0 && (
          <Button size="md" fullWidth disabled={!selected} loading={linking} onClick={() => void save()}>
            Link {selected ? propertyLabel(selected) : "property"}
          </Button>
        )}
      </div>

      <Text className={classes.help}>
        Don't see your site?{" "}
        <Anchor href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" size="xs">
          Add it in Search Console <ExternalLink size={11} />
        </Anchor>
      </Text>
    </div>
  );
}
