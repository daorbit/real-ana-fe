import { Braces, FileWarning } from "lucide-react";
import type { SeoSchemaValidation, SeoSchemaFinding } from "@/shared/types";
import { EmptyState } from "@/shared/ui/EmptyState";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { Pill, StatusMark } from "@/features/seo/components/shared/Pill";
import { ListEmpty, ListRow, ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import classes from "@/features/seo/components/panels/onpage.module.css";

function byType(findings: SeoSchemaFinding[]): [string, SeoSchemaFinding[]][] {
  const map = new Map<string, SeoSchemaFinding[]>();
  for (const f of findings) map.set(f.type, [...(map.get(f.type) ?? []), f]);
  return [...map.entries()];
}

function FindingList({ title, findings, tone }: { title: string; findings: SeoSchemaFinding[]; tone: "bad" | "warn" }) {
  return (
    <SeoList>
      <ListTitle>
        {title} · {findings.length}
      </ListTitle>
      {byType(findings).map(([type, list]) => (
        <ListRow
          key={type}
          top
          lead={<Pill tone={tone} mono>{type}</Pill>}
          title={
            <span className={classes.findings}>
              {list.map((f, i) => (
                <span key={i} className={classes.findingRow}>
                  {f.property && <Pill mono>{f.property}</Pill>}
                  {f.message}
                </span>
              ))}
            </span>
          }
        />
      ))}
    </SeoList>
  );
}

export function SchemaPanel({ schema }: { schema?: SeoSchemaValidation }) {
  if (!schema) {
    return (
      <EmptyState
        compact
        icon={Braces}
        title="Not checked on this report"
        description="This audit ran before structured-data validation was added. Re-run it to check the page's JSON-LD."
      />
    );
  }

  if (!schema.blocks.length) {
    return (
      <EmptyState
        compact
        icon={FileWarning}
        title="No structured data"
        description="This page has no JSON-LD. Adding schema lets search engines show rich results such as ratings, breadcrumbs and FAQ answers."
      />
    );
  }

  const errors = schema.findings.filter((f) => f.severity === "error");
  const warnings = schema.findings.filter((f) => f.severity === "warning");
  const invalidBlocks = schema.blocks.filter((b) => !b.valid).length;
  const errorTypes = new Set(errors.map((f) => f.type));

  return (
    <div className={classes.stack}>
      <Tiles>
        <Tile label="Blocks" value={String(schema.blocks.length)} />
        <Tile label="Types" value={String(schema.types.length)} />
        <Tile label="Errors" value={String(errors.length + invalidBlocks)} tone={errors.length + invalidBlocks ? "bad" : undefined} />
        <Tile label="Recommended" value={String(warnings.length)} tone={warnings.length ? "warn" : undefined} />
      </Tiles>

      <SeoCard title="Found on this page" description="Schema.org types in the page's JSON-LD." flush>
        {schema.types.map((type) => {
          const ok = !errorTypes.has(type);
          return (
            <ListRow
              key={type}
              lead={<StatusMark ok={ok} tone={ok ? "good" : "bad"} />}
              title={<Pill tone={ok ? "good" : "bad"} mono>{type}</Pill>}
              aside={<span className={classes.chipCount}>{ok ? "Valid" : "Has errors"}</span>}
            />
          );
        })}
        {invalidBlocks > 0 && (
          <ListRow
            lead={<StatusMark ok={false} tone="bad" />}
            title={`${invalidBlocks} block${invalidBlocks === 1 ? "" : "s"} failed to parse as JSON`}
            sub="Search engines ignore an invalid block entirely."
          />
        )}
        {!schema.types.length && !invalidBlocks && <ListEmpty>No recognised types.</ListEmpty>}
      </SeoCard>

      {errors.length > 0 && <FindingList title="Errors" findings={errors} tone="bad" />}
      {warnings.length > 0 && <FindingList title="Recommended" findings={warnings} tone="warn" />}
    </div>
  );
}
