import type { ReactNode } from "react";
import { Button, Select } from "@mantine/core";
import { Globe, Link2 } from "lucide-react";
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
  footer,
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
  footer?: ReactNode;
}) {
  const bar = (
    <div className={layout.inspect} data-hero={hero || undefined} data-grouped={footer ? true : undefined}>
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
          <label className={layout.address}>
            <Link2 size={15} className={layout.addressIcon} />
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
            radius="sm"
            disabled={analyzing}
            onClick={onRun}
            className={layout.inspectButton}
          >
            Run audit
          </Button>
        </>
      )}
    </div>
  );

  if (!footer) return bar;

  return (
    <div className={layout.inspectCard}>
      {bar}
      <div className={layout.inspectFoot}>{footer}</div>
    </div>
  );
}
