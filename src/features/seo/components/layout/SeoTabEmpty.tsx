import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import {
  ArrowRight, Bot, CircleAlert, FileCode2, FileText, Filter, Gauge, Heading, HeartPulse, Image, Link2,
  ListOrdered, ShieldCheck, Timer, Wrench, type LucideIcon,
} from "lucide-react";
import { StartCard, StartHero, StartScreen, StartSection } from "@/shared/ui/start/StartScreen";
import {
  ChecksPreview, HeadingsPreview, IssuesPreview, ScorePreview, SnippetPreview, VitalsPreview,
} from "../start/SeoPreviews";
import { seoTabPath, type SeoTabId } from "../sections";

type SubTab = Exclude<SeoTabId, "overview">;

interface Card {
  icon: LucideIcon;
  title: string;
  text: string;
  preview: ReactNode;
}

interface Copy {
  icon: LucideIcon;
  title: string;
  text: string;
  cards: Card[];
}

function copyFor(tab: SubTab, domain: string): Copy {
  switch (tab) {
    case "issues":
      return {
        icon: CircleAlert,
        title: "Every problem, worst first",
        text: "Once a page is audited, each issue from every check is listed here by severity, with what it means and how to fix it.",
        cards: [
          { icon: ListOrdered, title: "Ranked by severity", text: "Critical problems first, then warnings, then suggestions.", preview: <IssuesPreview /> },
          { icon: ShieldCheck, title: "From every check", text: "Meta, content, links, schema, robots.txt, sitemap, AI search and speed.", preview: <ChecksPreview /> },
          {
            icon: Filter,
            title: "Filter, copy, fix",
            text: "Narrow by severity, copy the list for your developer, or ask Orbit how to fix one.",
            preview: <ChecksPreview items={[{ label: "Critical", ok: false }, { label: "Warnings", ok: false }, { label: "Suggestions", ok: true }]} />,
          },
        ],
      };
    case "onpage":
      return {
        icon: FileCode2,
        title: "What's on the page itself",
        text: "An audit reads the page the way a search engine does: its tags, copy, images and structured data.",
        cards: [
          { icon: FileText, title: "Meta tags", text: "Title, description and social cards, previewed as searchers see them.", preview: <SnippetPreview domain={domain} /> },
          { icon: Heading, title: "Content & headings", text: "Heading structure, word count, readability and the keywords the page leans on.", preview: <HeadingsPreview /> },
          {
            icon: Image,
            title: "Images & structured data",
            text: "Alt text, sizes and lazy loading, plus Schema.org markup for rich results.",
            preview: <ChecksPreview items={[{ label: "Alt text", ok: true }, { label: "Image sizes", ok: true }, { label: "Lazy loading", ok: false }, { label: "Schema.org", ok: true }]} />,
          },
        ],
      };
    case "performance":
      return {
        icon: Gauge,
        title: "How fast the page feels",
        text: "Each audit runs Lighthouse on desktop and mobile and adds Core Web Vitals from real visitors when Google has them.",
        cards: [
          { icon: Gauge, title: "Lighthouse scores", text: "Performance, accessibility, best practices and SEO, out of 100.", preview: <ScorePreview /> },
          { icon: Timer, title: "Core Web Vitals", text: "Loading, responsiveness and layout shift, measured on real devices.", preview: <VitalsPreview /> },
          { icon: Wrench, title: "What to speed up", text: "The fixes that save the most time, ordered by impact.", preview: <IssuesPreview /> },
        ],
      };
    case "site":
      return {
        icon: HeartPulse,
        title: "The site around the page",
        text: "Beyond one page, an audit checks the server setup, links, how crawlers move through the site and whether AI can read it.",
        cards: [
          { icon: ShieldCheck, title: "Technical setup", text: "HTTPS, response, robots.txt, sitemap and canonical tags.", preview: <ChecksPreview /> },
          {
            icon: Link2,
            title: "Links & crawl",
            text: "Broken links, redirects and server errors, and the pages found by following links.",
            preview: <ChecksPreview items={[{ label: "Internal links", ok: true }, { label: "External links", ok: true }, { label: "Redirects", ok: false }, { label: "Broken links", ok: true }]} />,
          },
          {
            icon: Bot,
            title: "AI search access",
            text: "Whether ChatGPT, Claude, Perplexity and Google AI can read and cite the site.",
            preview: <ChecksPreview items={[{ label: "GPTBot", ok: true }, { label: "ClaudeBot", ok: true }, { label: "PerplexityBot", ok: false }, { label: "llms.txt", ok: false }]} />,
          },
        ],
      };
  }
}

export function SeoTabEmpty({ tab, canEdit, domain }: { tab: SubTab; canEdit: boolean; domain: string }) {
  const copy = copyFor(tab, domain);
  const HeroIcon = copy.icon;

  return (
    <StartScreen>
      <StartHero
        id={`seo-${tab}-empty-title`}
        icon={<HeroIcon size={28} />}
        title={copy.title}
        text={canEdit ? copy.text : `${copy.text} Nobody has audited this site yet, so ask an editor to run the first audit.`}
      >
        {canEdit && (
          <>
            <Button size="md" component={Link} to={seoTabPath("overview")} rightSection={<ArrowRight size={16} />}>
              Run your first audit
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Takes about 30 seconds. Results show up on every SEO page.
            </Text>
          </>
        )}
      </StartHero>

      <StartSection id={`seo-${tab}-empty-features`} title="What you'll see here" columns={3}>
        {copy.cards.map((card) => {
          const Icon = card.icon;
          return <StartCard key={card.title} icon={<Icon size={14} />} title={card.title} text={card.text} preview={card.preview} />;
        })}
      </StartSection>
    </StartScreen>
  );
}
