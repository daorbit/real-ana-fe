import { DOCS_SLUGS, docsUrl } from "@/shared/lib/docsSlugs";
import type { FrameworkGuide } from "@/features/workspace/frameworks";

export function developerEmailHref({
  domain,
  guide,
  snippet,
}: {
  domain: string;
  guide: FrameworkGuide;
  snippet: string;
}): string {
  const subject = `Please add the Quantalog tracking snippet to ${domain}`;
  const body = [
    "Hi,",
    "",
    `Could you add our Quantalog analytics snippet to ${domain}? It's one script tag and takes a couple of minutes.`,
    "",
    `Where: ${guide.placement} (${guide.filename})`,
    "",
    snippet,
    "",
    `Setup guide: ${docsUrl(DOCS_SLUGS.tracking)}`,
    "",
    "Thanks!",
  ].join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
