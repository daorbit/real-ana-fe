import type { ReactNode } from "react";
import { FileText, Gauge, Heading, Search, ShieldCheck } from "lucide-react";
import { StartCard, StartChips, StartHero, StartScreen, StartSection } from "@/shared/ui/start/StartScreen";
import { ChecksPreview, HeadingsPreview, ScorePreview, SnippetPreview } from "./SeoPreviews";

const QUICK_PATHS = [
  { label: "Homepage", value: "/" },
  { label: "/pricing", value: "/pricing" },
  { label: "/blog", value: "/blog" },
  { label: "/about", value: "/about" },
  { label: "/contact", value: "/contact" },
];

export function SeoStartPanel({
  domain,
  canEdit,
  path,
  onPath,
  inspectBar,
}: {
  domain: string;
  canEdit: boolean;
  path: string;
  onPath: (path: string) => void;
  inspectBar: ReactNode;
}) {
  return (
    <StartScreen>
      <StartHero
        id="seo-start-title"
        icon={<Search size={28} />}
        title={canEdit ? "Audit your first page" : "No audits yet"}
        text={
          canEdit
            ? `See how ${domain || "your site"} looks to Google — meta tags, content, technical setup and Lighthouse speed, in about 30 seconds.`
            : "Nobody has audited this site yet. Once an editor runs the first audit, the full report shows up here for everyone."
        }
      >
        {inspectBar}
        {canEdit && <StartChips label="Try" items={QUICK_PATHS} active={path} onPick={onPath} />}
      </StartHero>

      <StartSection
        id="seo-start-features"
        title="What's in every report"
        sub="Four areas, each scored, with plain-English fixes for anything that's off."
      >
        <StartCard
          icon={<Gauge size={14} />}
          title="SEO score & Lighthouse"
          text="One score out of 100, plus real Lighthouse results for speed, accessibility and best practices."
          preview={<ScorePreview />}
        />
        <StartCard
          icon={<FileText size={14} />}
          title="How you look on Google"
          text="Your title, description and social cards, previewed the way searchers and sharers see them."
          preview={<SnippetPreview domain={domain} />}
        />
        <StartCard
          icon={<Heading size={14} />}
          title="Content & headings"
          text="Heading structure, word count, images missing alt text and what the page is really about."
          preview={<HeadingsPreview />}
        />
        <StartCard
          icon={<ShieldCheck size={14} />}
          title="Technical checks"
          text="HTTPS, robots.txt, sitemap, canonical tags, structured data and broken links."
          preview={<ChecksPreview />}
        />
      </StartSection>
    </StartScreen>
  );
}
