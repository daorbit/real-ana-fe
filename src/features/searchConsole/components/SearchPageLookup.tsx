import { useState } from "react";
import { Autocomplete, Button, Loader, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ArrowRight, FileSearch } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import type { SearchType } from "@/shared/types";
import { METRIC_BY_KEY, pagePath, propertyLabel, resolvePageUrl } from "../searchMetrics";
import classes from "./lookup.module.css";

export function SearchPageLookup({
  workspaceId,
  siteId,
  propertyUrl,
  days,
  type,
  onOpen,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  days: number;
  type: SearchType;
  onOpen: (url: string) => void;
}) {
  const [value, setValue] = useState("");
  const [q] = useDebouncedValue(value.trim(), 250);

  const { data, isFetching } = useGetSearchBreakdownQuery(
    { workspaceId, siteId, dimension: "page", days, type, page: 1, pageSize: 10, sort: "clicks", dir: "desc", q },
    { skip: !q },
  );

  const rows = q ? (data?.rows ?? []) : [];
  const clicksByUrl = new Map(rows.map((r) => [r.key, r.clicks]));

  const submit = (input: string) => {
    if (!input.trim()) return;
    onOpen(resolvePageUrl(propertyUrl, input));
  };

  return (
    <div className={classes.lookup}>
      <div className={classes.lookupText}>
        <span className={classes.lookupIcon}>
          <FileSearch size={18} />
        </span>
        <div>
          <Text fw={650} size="sm">
            Look up a page
          </Text>
          <Text size="xs" c="dimmed">
            Clicks, queries and Google index status for any page on {propertyLabel(propertyUrl)}.
          </Text>
        </div>
      </div>
      <form
        className={classes.lookupForm}
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <Autocomplete
          className={classes.lookupInput}
          placeholder="Type a path like /pricing or paste a full URL"
          value={value}
          onChange={setValue}
          data={rows.map((r) => ({ value: r.key, label: pagePath(r.key) }))}
          filter={({ options }) => options}
          onOptionSubmit={submit}
          rightSection={isFetching ? <Loader size={14} /> : null}
          renderOption={({ option }) => (
            <div className={classes.option}>
              <span className={classes.optionPath}>{pagePath(option.value)}</span>
              <span className={classes.optionMeta}>
                {METRIC_BY_KEY.clicks.format(clicksByUrl.get(option.value) ?? 0)} clicks
              </span>
            </div>
          )}
          aria-label="Page path or URL"
          comboboxProps={{ withinPortal: true }}
        />
        <Button type="submit" rightSection={<ArrowRight size={14} />} disabled={!value.trim()}>
          Analyze
        </Button>
      </form>
    </div>
  );
}
