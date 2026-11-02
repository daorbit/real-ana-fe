import { Gauge, ShieldCheck } from "lucide-react";
import type { SeoPerformance, SeoResource, SeoSuggestion } from "@/shared/types";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { EmptyState } from "@/shared/ui/EmptyState";
import { SeoSection } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import {
  Disclosure, DisclosureActions, DisclosureText, SeoList,
} from "@/features/seo/components/shared/SeoList";
import { scoreTone } from "@/features/seo/components/shared/tone";
import { sourceLabel } from "./issueText";
import classes from "./performance/performance.module.css";

const CATEGORY_ORDER = ["performance", "accessibility", "seo", "best-practices"];

function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

function sorted(suggestions: SeoSuggestion[]): SeoSuggestion[] {
  return [...suggestions].sort((a, b) => categoryRank(a.category) - categoryRank(b.category));
}

function Resources({ suggestion }: { suggestion: SeoSuggestion }) {
  const items = suggestion.items ?? suggestion.resources.map((url): SeoResource => ({ url }));
  if (!items.length) return null;
  return (
    <>
      <DisclosureText label="Affected resources" />
      <div className={classes.resources}>
        {items.map((r) => {
          const cost = [
            r.wastedBytes ? `${Math.round(r.wastedBytes / 1024)} KB` : null,
            r.wastedMs ? `${Math.round(r.wastedMs)} ms` : null,
          ].filter(Boolean);
          return (
            <div key={r.url} className={classes.resource}>
              <span className={classes.resourceUrl} title={r.url}>{r.url}</span>
              {cost.length > 0 && <span className={classes.resourceCost}>{cost.join(" · ")}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function SuggestionsPanel({ performance }: { performance: SeoPerformance }) {
  const body = !performance.available ? (
    <EmptyState
      compact
      icon={Gauge}
      title="No Lighthouse data"
      description="This report has no Lighthouse audit attached. Run it again to pull fresh performance, accessibility and SEO scores."
    />
  ) : !performance.suggestions.length ? (
    <EmptyState compact icon={ShieldCheck} title="Clean sweep" description="Lighthouse found nothing to fix on this page." />
  ) : (
    <SeoList>
      {sorted(performance.suggestions).map((s) => (
        <Disclosure
          key={s.id}
          title={s.title}
          sub={`${sourceLabel(s.category)}${s.description ? ` · ${s.description}` : ""}`}
          aside={s.displayValue ? <Pill tone={scoreTone(s.score) === "good" ? "neutral" : scoreTone(s.score)}>{s.displayValue}</Pill> : undefined}
        >
          <DisclosureText label="How to fix it">{s.advice}</DisclosureText>
          {s.description && s.description !== s.advice && <DisclosureText>{s.description}</DisclosureText>}
          <Resources suggestion={s} />
          <DisclosureActions>
            <AskOrbitButton
              size="xs"
              label="How do I fix this?"
              question={`My Lighthouse audit flagged: "${s.title}". ${s.advice} What exactly do I change to fix this?`}
            />
          </DisclosureActions>
        </Disclosure>
      ))}
    </SeoList>
  );

  return (
    <SeoSection title="What to speed up" description="Lighthouse findings for this page, grouped by category and worst first.">
      {body}
    </SeoSection>
  );
}
