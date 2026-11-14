import { toPreviewPage } from "@/features/bio/lib/bioDraft";
import { emptyRelease, newRowId, randomSlug } from "@/features/bio/lib/bioOptions";
import { newServiceRow } from "@/features/bio/lib/serviceRows";
import type { BioPageInput, BioTheme, PublicBioPage } from "@/features/bio/types";
import { PROFILE_TEMPLATES } from "./profileTemplates";
import { RELEASE_TEMPLATES } from "./releaseTemplates";
import { sampleArt } from "./sampleArt";
import { SIGNATURE_TEMPLATES } from "./signatureTemplates";
import type { BioTemplate } from "./templateTypes";

export const BIO_TEMPLATES: BioTemplate[] = [...SIGNATURE_TEMPLATES, ...RELEASE_TEMPLATES, ...PROFILE_TEMPLATES];

export function templateById(id: string | null): BioTemplate | null {
  return BIO_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function draftFromTemplate(template: BioTemplate, workspaceName: string): BioPageInput {
  const release = template.kind === "release";
  return {
    kind: template.kind,
    slug: randomSlug(),
    title: !release && workspaceName ? workspaceName : template.title,
    bio: template.bio ?? "",
    avatarUrl: "",
    links: (template.links ?? []).map((label) => ({ id: newRowId(), label, url: "", enabled: true })),
    socials: (template.socials ?? []).map((network) => ({ id: newRowId(), network, url: "" })),
    release: release
      ? {
          ...emptyRelease(),
          subtitle: template.subtitle ?? "",
          rows: (template.services ?? []).map(({ service, action }) => newServiceRow(service, "", action)),
        }
      : null,
    theme: { ...template.theme },
    published: true,
  };
}

export function templatePreview(template: BioTemplate): PublicBioPage {
  const art = sampleArt(template.art.color, template.art.motif);
  const draft = draftFromTemplate(template, "");
  return {
    id: template.id,
    kind: draft.kind,
    slug: template.id,
    title: draft.title,
    bio: draft.bio,
    avatarUrl: draft.kind === "profile" ? art : "",
    links: draft.links.map(({ id, label }) => ({ id, label, url: "#" })),
    socials: draft.socials.map((s) => ({ ...s, url: "#" })),
    release: draft.release
      ? {
          artworkUrl: art,
          subtitle: draft.release.subtitle,
          releaseDate: "",
          rows: draft.release.rows.map(({ id, service, name, action }) => ({ id, service, name, action, url: "#" })),
        }
      : null,
    theme: draft.theme,
  };
}

export function templateOnContent(template: BioTemplate, draft: BioPageInput): PublicBioPage {
  const sample = templatePreview(template);
  const own = toPreviewPage(draft);
  const release = own.release && sample.release
    ? {
        ...own.release,
        artworkUrl: own.release.artworkUrl || sample.release.artworkUrl,
        rows: own.release.rows.length ? own.release.rows : sample.release.rows,
      }
    : sample.release;
  return {
    ...own,
    title: own.title.trim() || sample.title,
    bio: own.bio.trim() || sample.bio,
    avatarUrl: own.avatarUrl || sample.avatarUrl,
    links: own.links.length ? own.links : sample.links,
    socials: own.socials.length ? own.socials : sample.socials,
    release,
    theme: { ...template.theme },
  };
}

function sameTheme(a: BioTheme, b: BioTheme): boolean {
  return (Object.keys(a) as (keyof BioTheme)[]).every((key) => a[key] === b[key]);
}

export function templateForTheme(theme: BioTheme): BioTemplate | null {
  return BIO_TEMPLATES.find((t) => sameTheme(t.theme, theme)) ?? null;
}
