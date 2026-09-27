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
import { PickerTopBar } from "./PickerTopBar";
import classes from "./picker.module.css";

const PERMISSION_LABEL: Record<string, string> = {
  siteOwner: "Owner",
  siteFullUser: "Full access",
  siteRestrictedUser: "Restricted",
};

function PropertyCard({ property, recommended }: { property: SearchConsolePropertyOption; recommended?: boolean }) {
  const domain = property.propertyUrl.startsWith("sc-domain:");
  const Icon = domain ? Globe : Link2;
  return (
    <Radio.Card value={property.propertyUrl} className={classes.option} data-mismatch={!property.matches || undefined}>
      <span className={classes.optionIcon}>
        <Icon size={16} />
      </span>
      <span className={classes.optionText}>
        <span className={classes.optionTitle}>
          <Text size="sm" fw={650} truncate>
            {propertyLabel(property.propertyUrl)}
          </Text>
          {recommended && <span className={classes.recommended}>Recommended</span>}
          {!property.matches && <span className={classes.mismatch}>Different domain</span>}
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
      <li className={classes.stepDone}>
        <span className={classes.stepDot}>
          <Check size={11} strokeWidth={3} />
        </span>
        Google connected
      </li>
      <li className={classes.stepLine} aria-hidden />
      <li className={classes.stepCurrent}>
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
  const chosen = properties.find((p) => p.propertyUrl === selected) ?? null;
  const mismatch = Boolean(chosen && !chosen.matches);
  const othersOpen = showOthers || matching.length === 0;

  useEffect(() => {
    setSelected(matching[0]?.propertyUrl ?? null);
    setShowOthers(false);
  }, [data]);

  const save = async () => {
    if (!chosen) return;
    try {
      await link({ workspaceId, siteId, propertyUrl: chosen.propertyUrl, allowMismatch: mismatch }).unwrap();
      notify.success("Search Console property linked");
    } catch (e) {
      notify.error(errMessage(e, "Could not link that property."));
    }
  };

  if (isLoading) return <PropertyPickerSkeleton />;

  if (error) {
    return (
      <div className={classes.wrap}>
        <PickerTopBar workspaceId={workspaceId} siteId={siteId} />
        <Alert color="red" variant="light" icon={<AlertTriangle size={16} />} w="100%">
          {errMessage(error, "Could not load your Search Console properties.")}
        </Alert>
      </div>
    );
  }

  return (
    <div className={classes.wrap}>
      <PickerTopBar workspaceId={workspaceId} siteId={siteId} />
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

        <Radio.Group value={selected} onChange={setSelected}>
          <div className={classes.options}>
            {matching.map((p, i) => (
              <PropertyCard key={p.propertyUrl} property={p} recommended={i === 0 && matching.length > 1} />
            ))}

            {matching.length === 0 && (
              <div className={classes.empty}>
                <AlertTriangle size={18} />
                <Text size="sm" fw={600}>
                  {properties.length ? `No property matches ${domain}` : "No Search Console properties yet"}
                </Text>
                <Text size="xs" c="dimmed">
                  {properties.length
                    ? `Verify ${domain} in Search Console, switch to the Google account that owns it, or pick another property below.`
                    : `Add and verify ${domain} in Search Console with this Google account, then refresh.`}
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
              <>
                {matching.length > 0 ? (
                  <UnstyledButton className={classes.othersToggle} onClick={() => setShowOthers((v) => !v)}>
                    {others.length} other propert{others.length === 1 ? "y" : "ies"} on this account
                    <ChevronDown size={13} className={classes.chevron} data-open={othersOpen || undefined} />
                  </UnstyledButton>
                ) : (
                  <Text className={classes.othersLabel}>Other properties on this account</Text>
                )}
                <Collapse expanded={othersOpen}>
                  <div className={classes.options}>
                    {others.map((p) => (
                      <PropertyCard key={p.propertyUrl} property={p} />
                    ))}
                  </div>
                </Collapse>
              </>
            )}
          </div>
        </Radio.Group>

        {mismatch && chosen && (
          <div className={classes.warning}>
            <AlertTriangle size={15} />
            <Text size="xs">
              <b>{propertyLabel(chosen.propertyUrl)}</b> is a different domain from {domain}. Search visibility will
              show that property's Google data for this site.
            </Text>
          </div>
        )}

        {properties.length > 0 && (
          <Button
            size="md"
            fullWidth
            color={mismatch ? "yellow" : undefined}
            disabled={!chosen}
            loading={linking}
            onClick={() => void save()}
          >
            {chosen ? `${mismatch ? "Link anyway" : "Link"} ${propertyLabel(chosen.propertyUrl)}` : "Choose a property"}
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
