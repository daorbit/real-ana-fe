import { useEffect, useState } from "react";
import {
  Stack, Group, Text, Switch, TextInput, Collapse, Button, Divider, Badge,
} from "@mantine/core";
import { SlidersHorizontal, ChevronDown, ChevronUp, Save } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { useUpdateSiteOptionsMutation } from "../store";
import { trackingSnippetPretty, type TrackerOptions } from "../utils";
import { notify, errMessage } from "../notify";

/** Split a comma-separated field into clean entries. */
function list(v: string): string[] {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

const DEFAULTS: Required<TrackerOptions> = {
  dnt: false,
  hash: false,
  clicks: true,
  errors: true,
  ignorePages: [],
  allowParams: [],
  domain: "",
};

/**
 * Rebuilds a site's install snippet from its saved options, and lets them be
 * changed.
 *
 * Saving here updates what the dashboard *generates*; it does not change what
 * the site reports, because the tracker reads its options from the script tag
 * already deployed. That is why saving prompts the user to re-copy rather than
 * reporting the change as live.
 */
export function SnippetBuilder({
  siteId,
  workspaceId,
  options: saved,
}: {
  siteId: string;
  workspaceId: string;
  options?: TrackerOptions;
}) {
  const [open, setOpen] = useState(false);
  const [updateOptions, { isLoading: saving }] = useUpdateSiteOptionsMutation();

  const initial = { ...DEFAULTS, ...(saved ?? {}) };

  const [dnt, setDnt] = useState(initial.dnt);
  const [hash, setHash] = useState(initial.hash);
  const [clicks, setClicks] = useState(initial.clicks);
  const [errors, setErrors] = useState(initial.errors);
  const [ignorePages, setIgnorePages] = useState(initial.ignorePages.join(", "));
  const [allowParams, setAllowParams] = useState(initial.allowParams.join(", "));
  const [domain, setDomain] = useState(initial.domain);

  // Re-seed when the server's copy changes — after a save elsewhere, or when
  // the cached site list refreshes.
  useEffect(() => {
    const s = { ...DEFAULTS, ...(saved ?? {}) };
    setDnt(s.dnt);
    setHash(s.hash);
    setClicks(s.clicks);
    setErrors(s.errors);
    setIgnorePages(s.ignorePages.join(", "));
    setAllowParams(s.allowParams.join(", "));
    setDomain(s.domain);
  }, [saved]);

  const options: TrackerOptions = {
    dnt,
    hash,
    clicks,
    errors,
    ignorePages: list(ignorePages),
    allowParams: list(allowParams),
    domain,
  };

  const same = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x, i) => x === b[i]);

  const dirty =
    dnt !== initial.dnt ||
    hash !== initial.hash ||
    clicks !== initial.clicks ||
    errors !== initial.errors ||
    !same(list(ignorePages), initial.ignorePages) ||
    !same(list(allowParams), initial.allowParams) ||
    domain.trim() !== initial.domain;

  // How many options differ from the tracker's defaults — shown so a long
  // snippet never looks unexplained.
  const set =
    (dnt ? 1 : 0) + (hash ? 1 : 0) + (clicks ? 0 : 1) + (errors ? 0 : 1) +
    (list(ignorePages).length ? 1 : 0) + (list(allowParams).length ? 1 : 0) +
    (domain.trim() ? 1 : 0);

  const save = async () => {
    try {
      await updateOptions({ workspaceId, siteId, options }).unwrap();
      notify.success(
        "Copy the snippet again and redeploy to apply the change.",
        "Options saved",
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not save the options."));
    }
  };

  return (
    <Stack gap="sm">
      <CodeBlock code={trackingSnippetPretty(siteId, options)} filename="index.html" />

      <Group justify="space-between">
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftSection={<SlidersHorizontal size={14} />}
          rightSection={open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          onClick={() => setOpen((o) => !o)}
        >
          Options
        </Button>
        {set > 0 && (
          <Badge size="sm" variant="light" color="emerald">
            {set} option{set === 1 ? "" : "s"} set
          </Badge>
        )}
      </Group>

      <Collapse expanded={open}>
        <Stack gap="md" pt="xs">
          <Switch
            checked={dnt}
            onChange={(e) => setDnt(e.currentTarget.checked)}
            color="emerald"
            label="Respect Do Not Track"
            description="Skip visitors whose browser asks not to be tracked."
          />
          <Switch
            checked={hash}
            onChange={(e) => setHash(e.currentTarget.checked)}
            color="emerald"
            label="Hash-based routing"
            description="For apps that navigate with #/path."
          />
          <Switch
            checked={clicks}
            onChange={(e) => setClicks(e.currentTarget.checked)}
            color="emerald"
            label="Track clicks"
            description="Buttons, links, and anything tagged data-va-cta."
          />
          <Switch
            checked={errors}
            onChange={(e) => setErrors(e.currentTarget.checked)}
            color="emerald"
            label="Track JavaScript errors"
            description="Surfaces uncaught errors and failed promises by page."
          />

          <Divider />

          <TextInput
            label="Ignore pages"
            placeholder="/admin/*, /preview"
            description="Comma-separated. Use * to match any run of characters."
            value={ignorePages}
            onChange={(e) => setIgnorePages(e.currentTarget.value)}
          />
          <TextInput
            label="Keep query parameters"
            placeholder="plan, ref"
            description="Query strings are dropped by default. Name the ones worth keeping."
            value={allowParams}
            onChange={(e) => setAllowParams(e.currentTarget.value)}
          />
          <TextInput
            label="Report as domain"
            placeholder="Leave empty to use this site's domain"
            description="Lets a staging deploy report into this site's numbers."
            value={domain}
            onChange={(e) => setDomain(e.currentTarget.value)}
          />

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed" style={{ flex: 1 }}>
              Saving updates the snippet shown here. Your site keeps using the
              tag it already has until you re-copy and redeploy.
            </Text>
            <Button
              size="xs"
              leftSection={<Save size={14} />}
              onClick={save}
              loading={saving}
              disabled={!dirty}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Collapse>
    </Stack>
  );
}
