import type { SeoMeta } from "@/shared/types";
import { lengthTone, type Tone } from "@/features/seo/components/shared/tone";

export type MetaRow = {
  label: string;
  value: string;
  status: string;
  tone: Tone;
  image?: boolean;
};

function presence(label: string, value: string, optional = false, image = false): MetaRow {
  if (value) return { label, value, status: "Set", tone: "good", image };
  return optional
    ? { label, value, status: "Optional", tone: "neutral" }
    : { label, value, status: "Missing", tone: "warn" };
}

function measured(label: string, value: string, min: number, max: number): MetaRow {
  return {
    label,
    value,
    status: value ? `${value.length} chars` : "Missing",
    tone: lengthTone(value.length, min, max),
  };
}

function sameUrl(a: string, b: string): boolean {
  return a.replace(/\/$/, "") === b.replace(/\/$/, "");
}

export function coreTagRows(meta: SeoMeta, url: string): MetaRow[] {
  const noindex = /noindex/i.test(meta.robots);
  return [
    measured("Title", meta.title, 30, 60),
    measured("Meta description", meta.description, 120, 160),
    meta.canonical
      ? {
          label: "Canonical URL",
          value: meta.canonical,
          status: sameUrl(meta.canonical, url) ? "Self" : "Points elsewhere",
          tone: sameUrl(meta.canonical, url) ? "good" : "warn",
        }
      : presence("Canonical URL", ""),
    {
      label: "Robots",
      value: meta.robots,
      status: noindex ? "Noindex" : "Indexable",
      tone: noindex ? "bad" : "good",
    },
    presence("Viewport", meta.viewport),
    presence("Charset", meta.charset),
    presence("Favicon", meta.favicon, false, true),
    presence("Keywords", meta.keywords, true),
    presence("Author", meta.author, true),
  ];
}

export function socialTagRows(meta: SeoMeta): MetaRow[] {
  return [
    presence("og:title", meta.ogTitle),
    presence("og:description", meta.ogDescription),
    presence("og:image", meta.ogImage, false, true),
    presence("og:type", meta.ogType),
    presence("og:url", meta.ogUrl),
    presence("og:site_name", meta.ogSiteName, true),
    presence("twitter:card", meta.twitterCard),
    presence("twitter:title", meta.twitterTitle, true),
    presence("twitter:description", meta.twitterDescription, true),
    presence("twitter:image", meta.twitterImage, true, true),
    presence("twitter:site", meta.twitterSite, true),
  ];
}
