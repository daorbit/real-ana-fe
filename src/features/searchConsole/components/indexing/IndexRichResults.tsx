import { Pill } from "@/features/seo/components/shared/Pill";
import type { RichResultGroup } from "../../indexing";
import { SearchCountTable } from "../SearchCountTable";

export function IndexRichResults({ groups }: { groups: RichResultGroup[] }) {
  if (!groups.length) return null;

  return (
    <SearchCountTable
      title="Rich results"
      description="Structured data Google found on the pages checked so far."
      labelHeader="Type"
      valueHeaders={["Pages", "With issues"]}
      emptyText=""
      rows={groups.map((group) => ({
        key: group.type,
        label: group.label,
        values: [
          group.pages.toLocaleString(),
          group.withIssues ? <Pill tone="warn">{group.withIssues.toLocaleString()}</Pill> : <Pill tone="good">None</Pill>,
        ],
      }))}
    />
  );
}
