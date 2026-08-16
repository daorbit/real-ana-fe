import { Tooltip } from "@mantine/core";
import { Plus, X } from "lucide-react";

/**
 * Sits between field cards: a thin dashed rule with a small circular button
 * centered on it. Reads as a subtle separator, not a form control — active
 * state (page break set) swaps the icon and tints the line/button to match.
 */
export function PageBreakDivider({
  active, onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={active ? "page-break-row active" : "page-break-row"}>
      <hr className="page-break-line" />
      <Tooltip label={active ? "Remove page break" : "Add page break"} withArrow>
        <button type="button" className="page-break-toggle" onClick={onToggle} aria-label={active ? "Remove page break" : "Add page break"}>
          {active ? <X size={12} /> : <Plus size={12} />}
        </button>
      </Tooltip>
      <hr className="page-break-line" />
    </div>
  );
}
