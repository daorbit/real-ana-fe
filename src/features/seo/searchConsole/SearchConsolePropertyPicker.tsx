import { useEffect, useState } from "react";
import { Alert, Anchor, Badge, Button, Group, Radio, Skeleton, Stack, Text } from "@mantine/core";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import {
  useGetSearchConsolePropertiesQuery,
  useLinkSearchConsolePropertyMutation,
} from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { propertyLabel } from "./searchMetrics";
import classes from "./searchConsole.module.css";

const PERMISSION_LABEL: Record<string, string> = {
  siteOwner: "Owner",
  siteFullUser: "Full",
  siteRestrictedUser: "Restricted",
};

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
        <Skeleton height={52} radius="md" />
        <Skeleton height={52} radius="md" />
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
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Choose the Search Console property for {data?.domain}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Properties {googleEmail ? `${googleEmail} can see` : "this Google account can see"}.
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
      </div>

      {properties.length === 0 ? (
        <Alert color="gray" variant="light">
          <Text size="sm">
            This Google account has no Search Console properties yet. Add and verify{" "}
            <b>{data?.domain}</b> in{" "}
            <Anchor href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              Search Console <ExternalLink size={11} />
            </Anchor>
            , then press Refresh — or connect a different Google account.
          </Text>
        </Alert>
      ) : (
        <Radio.Group value={selected} onChange={setSelected}>
          <div className={classes.options}>
            {properties.map((p) => (
              <Radio.Card
                key={p.propertyUrl}
                value={p.propertyUrl}
                disabled={!p.matches}
                className={classes.option}
              >
                <Radio.Indicator disabled={!p.matches} />
                <span className={classes.optionText}>
                  <Text size="sm" fw={600} truncate>
                    {propertyLabel(p.propertyUrl)}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {p.propertyUrl.startsWith("sc-domain:") ? "Domain property" : "URL-prefix property"}
                    {!p.matches && ` · doesn't cover ${data?.domain}`}
                  </Text>
                </span>
                <Badge size="sm" variant="light" color="gray">
                  {PERMISSION_LABEL[p.permissionLevel] ?? p.permissionLevel}
                </Badge>
              </Radio.Card>
            ))}
          </div>
        </Radio.Group>
      )}

      {properties.length > 0 && matching.length === 0 && (
        <Text size="xs" c="dimmed" mt="sm">
          None of these cover {data?.domain}. Verify it in Search Console under this Google account, or
          connect the account that owns it.
        </Text>
      )}

      <Group justify="space-between" mt="lg" gap="sm">
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
