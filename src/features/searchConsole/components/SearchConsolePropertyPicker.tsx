import { useEffect, useState } from "react";
import { Alert, Button, Radio, Text } from "@mantine/core";
import { AlertTriangle, ArrowRight, RefreshCw, SearchX } from "lucide-react";
import {
  useGetSearchConsolePropertiesQuery,
  useLinkSearchConsolePropertyMutation,
} from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { propertyLabel } from "../searchMetrics";
import { PropertyPickerSkeleton } from "./SearchSkeletons";
import { PropertyPickerIntro } from "./PropertyPickerIntro";
import { PropertyTile } from "./PropertyTile";
import classes from "./picker.module.css";

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

  const properties = data?.properties ?? [];
  const matching = properties.filter((p) => p.matches);
  const others = properties.filter((p) => !p.matches);
  const domain = data?.domain ?? "this site";
  const chosen = properties.find((p) => p.propertyUrl === selected) ?? null;
  const mismatch = Boolean(chosen && !chosen.matches);

  useEffect(() => {
    setSelected(matching[0]?.propertyUrl ?? null);
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

  return (
    <div className={classes.layout}>
      <PropertyPickerIntro
        workspaceId={workspaceId}
        siteId={siteId}
        domain={domain}
        googleEmail={googleEmail}
        onSwitchAccount={onSwitchAccount}
        switching={switching}
      />

      <section className={classes.panel}>
        <header className={classes.panelHead}>
          <div>
            <Text fw={650} size="sm">
              Properties on this Google account
            </Text>
            <Text size="xs" c="dimmed">
              {properties.length} found · {matching.length} match {domain}
            </Text>
          </div>
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            leftSection={<RefreshCw size={13} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </header>

        {error ? (
          <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
            {errMessage(error, "Could not load your Search Console properties.")}
          </Alert>
        ) : properties.length === 0 ? (
          <div className={classes.empty}>
            <SearchX size={22} />
            <Text size="sm" fw={600}>
              No Search Console properties on this account
            </Text>
            <Text size="xs" c="dimmed">
              Add and verify {domain} in Search Console with this Google account, then press Refresh — or switch to the
              account that owns it.
            </Text>
          </div>
        ) : (
          <Radio.Group value={selected} onChange={setSelected}>
            <div className={classes.sections}>
              <div>
                <Text className={classes.sectionLabel}>Matches this site</Text>
                {matching.length ? (
                  <div className={classes.grid}>
                    {matching.map((p, i) => (
                      <PropertyTile key={p.propertyUrl} property={p} recommended={i === 0} />
                    ))}
                  </div>
                ) : (
                  <div className={classes.noMatch}>
                    <AlertTriangle size={15} />
                    <Text size="xs">
                      None of these properties cover {domain}. Verify it in Search Console, or pick one below.
                    </Text>
                  </div>
                )}
              </div>

              {others.length > 0 && (
                <div>
                  <Text className={classes.sectionLabel}>Other properties on this account</Text>
                  <div className={classes.grid}>
                    {others.map((p) => (
                      <PropertyTile key={p.propertyUrl} property={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Radio.Group>
        )}

        {properties.length > 0 && (
          <footer className={classes.panelFoot}>
            {mismatch && chosen ? (
              <div className={classes.warning}>
                <AlertTriangle size={15} />
                <Text size="xs">
                  <b>{propertyLabel(chosen.propertyUrl)}</b> is a different domain from {domain}. Its Google data will
                  show for this site.
                </Text>
              </div>
            ) : (
              <Text size="xs" c="dimmed" className={classes.footNote}>
                {chosen ? `Linking ${propertyLabel(chosen.propertyUrl)} to ${domain}` : "Select a property to continue"}
              </Text>
            )}
            <Button
              size="md"
              color={mismatch ? "yellow" : undefined}
              disabled={!chosen}
              loading={linking}
              rightSection={<ArrowRight size={16} />}
              onClick={() => void save()}
            >
              {mismatch ? "Link anyway" : "Link property"}
            </Button>
          </footer>
        )}
      </section>
    </div>
  );
}
