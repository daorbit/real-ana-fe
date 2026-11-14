import { looksLikeUrl } from "@/features/bio/lib/serviceCatalog";
import { newServiceRow } from "@/features/bio/lib/serviceRows";
import { useResolveLink } from "@/features/bio/hooks/useResolveLink";
import type { BioStudioState } from "@/features/bio/hooks/useBioStudio";
import { notify } from "@/shared/lib/notify";

function withScheme(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function useServicePaste(workspaceId: string | undefined, studio: BioStudioState) {
  const { resolve, resolving } = useResolveLink(workspaceId);

  const submit = async (raw: string) => {
    const urls = raw
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(looksLikeUrl)
      .map(withScheme);
    if (urls.length === 0) {
      if (raw.trim()) notify.error("Paste a full link, like open.spotify.com/track/…");
      return;
    }

    const existing = new Set((studio.draft.release?.rows ?? []).map((row) => row.url));
    const fresh = urls.filter((url) => !existing.has(url));
    if (fresh.length === 0) {
      notify.error("That link is already on the page.");
      return;
    }

    const resolved = await Promise.all(fresh.map((url) => resolve(url)));
    studio.addRows(resolved.map((r) => newServiceRow(r.service, r.url)));

    const first = resolved.find((r) => r.title || r.artworkUrl);
    if (first && !studio.draft.title.trim()) {
      studio.set({ title: first.artist ? `${first.artist} – ${first.title}` : first.title });
    }
    if (first?.artworkUrl && !studio.draft.release?.artworkUrl) studio.setRelease({ artworkUrl: first.artworkUrl });
  };

  return { submit, resolving };
}
