import { Button, Select } from "@mantine/core";
import { Globe, Search } from "lucide-react";
import type { Site } from "@/shared/types";
import layout from "./SeoLayout.module.css";

export function SeoInspectBar({
  sites,
  siteId,
  onSite,
  canEdit,
  domainLabel,
  path,
  onPath,
  onRun,
  analyzing,
  hero = false,
}: {
  sites: Site[];
  siteId: string;
  onSite: (siteId: string) => void;
  canEdit: boolean;
  domainLabel: string;
  path: string;
  onPath: (path: string) => void;
  onRun: () => void;
  analyzing: boolean;
  hero?: boolean;
}) {
  return (
    <div className={layout.inspect} data-hero={hero || undefined}>
      <Select
        variant="unstyled"
        className={layout.siteSelect}
        aria-label="Site"
        data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
        value={siteId}
        onChange={(v) => v && onSite(v)}
        allowDeselect={false}
        leftSection={<Globe size={15} />}
        comboboxProps={{ withinPortal: true, width: 260, position: "bottom-start" }}
      />
      {canEdit && (
        <>
          <span className={layout.inspectDivider} aria-hidden />
          <label className={layout.address}>
            <Search size={15} className={layout.addressIcon} />
            {domainLabel && <span className={layout.domain}>{domainLabel}</span>}
            <input
              className={layout.pathInput}
              aria-label="Page to audit"
              value={path}
              onChange={(e) => onPath(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && !analyzing && onRun()}
              placeholder="/"
              spellCheck={false}
            />
          </label>
          <Button
            size={hero ? "md" : "sm"}
            color={hero ? "emerald" : undefined}
            disabled={analyzing}
            onClick={onRun}
            className={layout.inspectButton}
          >
            {hero ? "Run audit" : "Inspect page"}
          </Button>
        </>
      )}
    </div>
  );
}
