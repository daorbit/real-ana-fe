import { useState } from "react";
import { Box, Collapse, Switch, TextInput, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import type { AddSiteForm } from "./useAddSiteForm";
import classes from "./AddSiteWizard.module.css";

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Box className={classes.row}>
      <Box className={classes.rowText}>
        <div className={classes.rowLabel}>{label}</div>
        <div className={classes.rowHint}>{hint}</div>
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} aria-label={label} />
    </Box>
  );
}

export function TrackingStep({ form }: { form: AddSiteForm }) {
  const t = form.tracking;
  const hasAdvanced = Boolean(t.ignorePages || t.allowParams || t.reportDomain);
  const [advancedOpen, setAdvancedOpen] = useState(hasAdvanced);

  return (
    <>
      <Box className={classes.rows}>
        <ToggleRow
          label="Track clicks"
          hint="Buttons, links and anything tagged data-va-cta."
          checked={t.clicks}
          onChange={t.setClicks}
        />
        <ToggleRow
          label="Track JavaScript errors"
          hint="Uncaught errors and failed promises, grouped by page."
          checked={t.errors}
          onChange={t.setErrors}
        />
        <ToggleRow
          label="Hash-based routing"
          hint="Turn on if your app navigates with #/path. Otherwise every route reports as one page."
          checked={t.hash}
          onChange={t.setHash}
        />
        <ToggleRow
          label="Respect Do Not Track"
          hint="Skip visitors whose browser asks not to be tracked. Quantalog stores no personal data either way."
          checked={t.dnt}
          onChange={t.setDnt}
        />
      </Box>

      <UnstyledButton
        className={classes.advancedToggle}
        onClick={() => setAdvancedOpen((v) => !v)}
        aria-expanded={advancedOpen}
      >
        <ChevronRight size={15} className={classes.chevron} data-open={advancedOpen || undefined} />
        Advanced settings
      </UnstyledButton>

      <Collapse expanded={advancedOpen}>
        <Box className={`${classes.rows} ${classes.advanced}`} mt="sm">
          <TextInput
            label="Ignore pages"
            placeholder="/admin/*, /preview"
            description="Comma-separated. Use * to match any run of characters."
            value={t.ignorePages}
            onChange={(e) => t.setIgnorePages(e.currentTarget.value)}
          />
          <TextInput
            label="Keep query parameters"
            placeholder="plan, ref"
            description="Query strings are dropped by default because they can carry personal data. Name the ones worth keeping."
            value={t.allowParams}
            onChange={(e) => t.setAllowParams(e.currentTarget.value)}
          />
          <TextInput
            label="Report as domain"
            placeholder="Leave empty to use the site's own domain"
            description="Lets a staging deploy report into this site's numbers."
            value={t.reportDomain}
            onChange={(e) => t.setReportDomain(e.currentTarget.value)}
          />
        </Box>
      </Collapse>
    </>
  );
}
