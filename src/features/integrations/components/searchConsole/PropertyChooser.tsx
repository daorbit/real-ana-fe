import { useEffect, useMemo, useState } from "react";
import { Button, Group, Select, Text } from "@mantine/core";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useGetSearchConsolePropertiesQuery, useLinkSearchConsolePropertyMutation } from "@/app/store";
import { propertyLabel } from "@/features/searchConsole/searchMetrics";
import { errMessage, notify } from "@/shared/lib/notify";
import classes from "./SearchConsole.module.css";

interface Props {
  workspaceId: string;
  siteId: string;
  current?: string;
  onDone: () => void;
}

export function PropertyChooser({ workspaceId, siteId, current, onDone }: Props) {
  const { data, isLoading, isFetching, error, refetch } = useGetSearchConsolePropertiesQuery({ workspaceId, siteId });
  const [link, { isLoading: linking }] = useLinkSearchConsolePropertyMutation();
  const [selected, setSelected] = useState<string | null>(current ?? null);

  const properties = useMemo(() => data?.properties ?? [], [data]);
  const domain = data?.domain ?? "this site";
  const chosen = properties.find((p) => p.propertyUrl === selected) ?? null;
  const mismatch = Boolean(chosen && !chosen.matches);

  useEffect(() => {
    setSelected((prev) => prev ?? properties.find((p) => p.matches)?.propertyUrl ?? null);
  }, [properties]);

  const options = useMemo(() => {
    const toItem = (p: (typeof properties)[number]) => ({ value: p.propertyUrl, label: propertyLabel(p.propertyUrl) });
    const matching = properties.filter((p) => p.matches).map(toItem);
    const others = properties.filter((p) => !p.matches).map(toItem);
    return [
      ...(matching.length ? [{ group: `Matches ${domain}`, items: matching }] : []),
      ...(others.length ? [{ group: "Other properties", items: others }] : []),
    ];
  }, [properties, domain]);

  const save = async () => {
    if (!chosen) return;
    try {
      await link({ workspaceId, siteId, propertyUrl: chosen.propertyUrl, allowMismatch: mismatch }).unwrap();
      notify.success(`${propertyLabel(chosen.propertyUrl)} linked to ${domain}`);
      onDone();
    } catch (e) {
      notify.error(errMessage(e, "Could not link that property."));
    }
  };

  if (error) {
    return (
      <div className={classes.chooser}>
        <Text size="sm" c="dimmed">
          {errMessage(error, "Could not load your Search Console properties.")}
        </Text>
        <Group gap="xs">
          <Button type="button" size="compact-sm" variant="default" onClick={() => refetch()} loading={isFetching}>
            Try again
          </Button>
          <Button type="button" size="compact-sm" variant="subtle" color="gray" onClick={onDone}>
            Cancel
          </Button>
        </Group>
      </div>
    );
  }

  if (!isLoading && properties.length === 0) {
    return (
      <div className={classes.chooser}>
        <Text size="sm" fw={600}>
          No Search Console properties on this Google account
        </Text>
        <Text size="xs" c="dimmed">
          Add and verify {domain} in Search Console with this account, then refresh. Or switch to the account that owns
          it.
        </Text>
        <Group gap="xs">
          <Button
            type="button"
            size="compact-sm"
            variant="default"
            leftSection={<RefreshCw size={13} />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
          <Button type="button" size="compact-sm" variant="subtle" color="gray" onClick={onDone}>
            Cancel
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div className={classes.chooser}>
      <div className={classes.chooserRow}>
        <Select
          className={classes.select}
          label={`Search Console property for ${domain}`}
          placeholder={isLoading ? "Loading properties…" : "Pick a property"}
          data={options}
          value={selected}
          onChange={setSelected}
          disabled={isLoading}
          searchable
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        <Button type="button" variant="default" onClick={onDone} disabled={linking}>
          Cancel
        </Button>
        <Button
          type="button"
          color={mismatch ? "yellow" : undefined}
          disabled={!chosen || chosen.propertyUrl === current}
          loading={linking}
          onClick={() => void save()}
        >
          {mismatch ? "Link anyway" : "Link property"}
        </Button>
      </div>
      {mismatch && chosen && (
        <div className={classes.warning}>
          <TriangleAlert size={14} className={classes.warningIcon} />
          <Text size="xs">
            {propertyLabel(chosen.propertyUrl)} is a different domain from {domain}. Its Google data will show for this
            site.
          </Text>
        </div>
      )}
    </div>
  );
}
