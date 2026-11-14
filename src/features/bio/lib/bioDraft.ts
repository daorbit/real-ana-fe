import { BIO_SLUG_PATTERN, newRowId, withThemeDefaults } from "@/features/bio/lib/bioOptions";
import type { BioPage, BioPageInput, PublicBioPage } from "@/features/bio/types";

export const BIO_DEMO_MESSAGE = "Link-in-bio pages are read-only in the demo. Sign up to build your own.";

export function toBioInput(page: BioPage): BioPageInput {
  return {
    kind: page.kind ?? "profile",
    slug: page.slug,
    title: page.title,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    links: page.links.map((link) => ({ ...link })),
    socials: page.socials.map((social) => ({ ...social, id: social.id || newRowId() })),
    release: page.release ? { ...page.release, rows: page.release.rows.map((row) => ({ ...row })) } : null,
    theme: withThemeDefaults(page.theme),
    published: page.published,
  };
}

export function toPublicPage(id: string, input: BioPageInput): PublicBioPage {
  return {
    id,
    kind: input.kind,
    slug: input.slug,
    title: input.title,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    links: input.links.filter((link) => link.enabled).map(({ id: linkId, label, url }) => ({ id: linkId, label, url })),
    socials: input.socials,
    release: input.release
      ? {
          artworkUrl: input.release.artworkUrl,
          subtitle: input.release.subtitle,
          releaseDate: input.release.releaseDate,
          rows: input.release.rows.filter((row) => row.enabled).map(({ id: rowId, service, name, url, action }) => ({ id: rowId, service, name, url, action })),
        }
      : null,
    theme: withThemeDefaults(input.theme),
  };
}

export function toPreviewPage(draft: BioPageInput): PublicBioPage {
  const page = toPublicPage("preview", draft);
  return {
    ...page,
    links: page.links.filter((link) => link.label.trim()),
    release: page.release ? { ...page.release, rows: page.release.rows.filter((row) => row.name.trim()) } : null,
  };
}

function releaseProblem(draft: BioPageInput): string | null {
  const rows = draft.release?.rows ?? [];
  if (rows.length === 0) return "Add at least one service.";
  const missing = rows.find((row) => !row.url.trim());
  if (missing) return `Add a link for ${missing.name || "each service"}, or remove that row.`;
  if (rows.some((row) => !row.name.trim() || !row.action.trim())) return "Every service needs a name and a button label.";
  return null;
}

function profileProblem(draft: BioPageInput): string | null {
  if (draft.links.some((link) => !link.label.trim())) return "Every link needs a title.";
  const missing = draft.links.find((link) => !link.url.trim());
  if (missing) return `Add an address for “${missing.label}”, or remove that link.`;
  if (draft.socials.some((social) => !social.url.trim())) return "Fill in or remove the empty social icons.";
  return null;
}

export function bioDraftProblem(draft: BioPageInput): string | null {
  if (!draft.title.trim()) return draft.kind === "release" ? "Add a title." : "Add a page title.";
  if (!BIO_SLUG_PATTERN.test(draft.slug)) return "The short link needs 3–32 letters, numbers or dashes.";
  return draft.kind === "release" ? releaseProblem(draft) : profileProblem(draft);
}
