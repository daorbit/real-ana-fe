import { useState } from "react";
import { TextInput, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { TemplateCard } from "@/features/dashboards/components/templates/TemplateCard";
import {
  BLANK_TEMPLATE, CATEGORY_ACCENT, TEMPLATES, TEMPLATE_CATEGORIES, matchesTemplate,
} from "@/features/dashboards/templates";
import type { DashboardTemplate, TemplateCategory } from "@/features/dashboards/templates";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

type Filter = "All" | TemplateCategory;

const FILTERS: Filter[] = ["All", ...TEMPLATE_CATEGORIES];

function countFor(filter: Filter) {
  return filter === "All" ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === filter).length;
}

export function TemplateGallery({ onOpen }: { onOpen: (template: DashboardTemplate) => void }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const items = TEMPLATES.filter((t) => (filter === "All" || t.category === filter) && matchesTemplate(t, query));
  const showBlank = filter === "All" && !query.trim();

  return (
    <>
      <div className={classes.toolbar}>
        <div className={classes.chips}>
          {FILTERS.map((f) => (
            <UnstyledButton
              key={f}
              className={`${classes.chip} ${shared.accent}`}
              data-accent={f === "All" ? undefined : CATEGORY_ACCENT[f]}
              data-active={filter === f || undefined}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f !== "All" && <span className={classes.chipDot} />}
              {f === "All" ? "All templates" : f}
              <span className={classes.chipCount}>{countFor(f)}</span>
            </UnstyledButton>
          ))}
        </div>
        <TextInput
          className={classes.search}
          leftSection={<Search size={15} />}
          placeholder="Search templates"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          aria-label="Search templates"
        />
      </div>

      {items.length === 0 && !showBlank ? (
        <EmptyState
          compact
          icon={Search}
          title="No templates match"
          description="Try another word, or start from a blank canvas."
          action={{ label: "Start blank", onClick: () => onOpen(BLANK_TEMPLATE) }}
        />
      ) : (
        <div className={classes.grid}>
          {showBlank && <TemplateCard template={BLANK_TEMPLATE} index={0} onOpen={() => onOpen(BLANK_TEMPLATE)} />}
          {items.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i + 1} onOpen={() => onOpen(t)} />
          ))}
        </div>
      )}
    </>
  );
}
