import { useEffect, useState } from "react";
import { Alert, Anchor, Badge, Button, Collapse, Group, Radio, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core";
import { AlertTriangle, ChevronDown, ExternalLink, Globe, Link2, RefreshCw } from "lucide-react";
import {
  useGetSearchConsolePropertiesQuery,
  useLinkSearchConsolePropertyMutation,
} from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import type { SearchConsolePropertyOption } from "@/shared/types";
import { propertyLabel } from "../searchMetrics";
import classes from "./connect.module.css";
import pickerClasses from "./picker.module.css";

const PERMISSION_LABEL: Record<string, string> = {
  siteOwner: "Owner",
  siteFullUser: "Full access",
  siteRestrictedUser: "Restricted",
};

function PropertyOption({ property, domain }: { property: SearchConsolePropertyOption; domain?: string }) {
  const isDomain = property.propertyUrl.startsWith("sc-domain:");
  return (
    <Radio.Card value={property.propertyUrl} disabled={!property.matches} className={pickerClasses.option}>
      <Radio.Indicator disabled={!property.matches} />
      <span className={pickerClasses.optionIcon}>{isDomain ? <Globe size={15} /> : <Link2 size={15} />}</span>
      <span className={pickerClasses.optionText}>
        <Text size="sm" fw={600} truncate>
          {propertyLabel(property.propertyUrl)}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {isDomain ? "Domain property · covers every subdomain" : "URL-prefix property"}
          {!property.matches && ` · doesn't cover ${domain}`}
        </Text>
      </span>
      <Badge size="sm" variant="light" color={property.matches ? "teal" : "gray"}>
        {PERMISSION_LABEL[property.permissionLevel] ?? property.permissionLevel}
      </Badge>
    </Radio.Card>
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

  if (isLoading) {
    return (
      <Stack gap="sm">
        <Skeleton height={120} radius="md" />
        <Skeleton height={64} radius="md" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Could not load your Search Console properties.")}
      </Alert>
    );
  }

  return (
    <div className={classes.card}>
      <div className={pickerClasses.body}>
        <div className={pickerClasses.head}>
          <div>
            <Text className={pickerClasses.step}>Step 2 of 2</Text>
            <Text fw={700} size="lg">
              Link a property to {data?.domain}
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Signed in as <b>{googleEmail || "your Google account"}</b>. Pick the Search Console property that
              covers this site.
            </Text>
          </div>
          <Button
            variant="default"
            size="xs"
            leftSection={<RefreshCw size={13} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh list
          </Button>
        </div>

        {properties.length === 0 ? (
          <Alert color="gray" variant="light">
            <Text size="sm">
              This Google account has no Search Console properties yet. Add and verify <b>{data?.domain}</b> in{" "}
              <Anchor href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                Search Console <ExternalLink size={11} />
              </Anchor>
              , then press Refresh list — or connect a different Google account.
            </Text>
          </Alert>
        ) : (
          <Radio.Group value={selected} onChange={setSelected}>
            <Stack gap="sm">
              {matching.length > 0 ? (
                <div className={pickerClasses.options}>
                  {matching.map((p) => (
                    <PropertyOption key={p.propertyUrl} property={p} domain={data?.domain} />
                  ))}
                </div>
              ) : (
                <Alert color="yellow" variant="light" icon={<AlertTriangle size={16} />}>
                  None of this account's properties cover {data?.domain}. Verify it in Search Console under this
                  account, or connect the Google account that owns it.
                </Alert>
              )}

              {others.length > 0 && (
                <>
                  <UnstyledButton className={pickerClasses.toggle} onClick={() => setShowOthers((v) => !v)}>
                    <ChevronDown size={14} className={pickerClasses.chevron} data-open={showOthers || undefined} />
                    {showOthers ? "Hide" : "Show"} {others.length} other propert{others.length === 1 ? "y" : "ies"} on
                    this account
                  </UnstyledButton>
                  <Collapse expanded={showOthers}>
                    <div className={pickerClasses.options}>
                      {others.map((p) => (
                        <PropertyOption key={p.propertyUrl} property={p} domain={data?.domain} />
                      ))}
                    </div>
                  </Collapse>
                </>
              )}
            </Stack>
          </Radio.Group>
        )}
      </div>

      <Group justify="space-between" gap="sm" className={pickerClasses.footer}>
        <Button variant="subtle" color="gray" loading={switching} onClick={onSwitchAccount}>
          Use a different Google account
        </Button>
        <Button disabled={!selected} loading={linking} onClick={() => void save()}>
          Link property
        </Button>
      </Group>
    </div>
  );
}
