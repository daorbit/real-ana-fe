import { BIO_SLUG_PATTERN } from "@/features/bio/lib/bioOptions";
import type { BioPage, BioPageInput } from "@/features/bio/types";

export const BIO_DEMO_MESSAGE = "Link-in-bio pages are read-only in the demo. Sign up to build your own.";

export function toBioInput(page: BioPage): BioPageInput {
  return {
    slug: page.slug,
    title: page.title,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    links: page.links.map((link) => ({ ...link })),
    socials: page.socials.map((social) => ({ ...social })),
    theme: { ...page.theme },
    published: page.published,
  };
}

export function bioDraftProblem(draft: BioPageInput): string | null {
  if (!draft.title.trim()) return "Add a page title.";
  if (!BIO_SLUG_PATTERN.test(draft.slug)) return "The page address needs 3–32 letters, numbers or dashes.";
  if (draft.links.some((link) => !link.label.trim() || !link.url.trim())) return "Every link needs a title and an address.";
  if (draft.socials.some((social) => !social.url.trim())) return "Fill in or remove empty social links.";
  return null;
}
