import { Select, type SelectProps } from "@mantine/core";
import { FileText, Home, Route } from "lucide-react";
import type { SeoPage } from "@/shared/types";
import { normalizePagePath, pageLabel } from "../../lib/seoPageParams";
import { scoreTone } from "../shared/tone";
import { Pill } from "../shared/Pill";
import layout from "./SeoLayout.module.css";

export function RoutePicker({
  pages,
  path,
  onPick,
}: {
  pages: SeoPage[];
  path: string;
  onPick: (path: string) => void;
}) {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const current = normalizePagePath(path);

  const renderOption: SelectProps["renderOption"] = ({ option }) => {
    const page = byPath.get(option.value);
    const Icon = option.value === "/" ? Home : FileText;
    return (
      <span className={layout.routeOption}>
        <Icon size={14} className={layout.addressIcon} />
        <span className={layout.routePath} translate="no">{option.label}</span>
        {page?.audit ? (
          <Pill tone={scoreTone(page.audit.score)}>{page.audit.score}</Pill>
        ) : (
          <span className={layout.routeHint}>Not audited</span>
        )}
      </span>
    );
  };

  return (
    <Select
      variant="unstyled"
      className={layout.siteSelect}
      aria-label="Route"
      placeholder="Pick a route"
      data={pages.map((p) => ({ value: p.path, label: pageLabel(p.path) }))}
      value={byPath.has(current) ? current : null}
      onChange={(v) => v && onPick(v)}
      allowDeselect={false}
      searchable
      nothingFoundMessage="No route matches"
      limit={80}
      maxDropdownHeight={320}
      renderOption={renderOption}
      leftSection={<Route size={15} />}
      comboboxProps={{ withinPortal: true, width: 380, position: "bottom-start" }}
    />
  );
}
