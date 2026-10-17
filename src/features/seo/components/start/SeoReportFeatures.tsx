import { FileText, Gauge, Heading, ShieldCheck } from "lucide-react";
import { StartCard, StartSection } from "@/shared/ui/start/StartScreen";
import { ChecksPreview, HeadingsPreview, ScorePreview, SnippetPreview } from "./SeoPreviews";

export function SeoReportFeatures({ domain }: { domain: string }) {
  return (
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
  );
}
