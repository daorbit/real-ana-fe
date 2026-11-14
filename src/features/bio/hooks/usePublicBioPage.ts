import { useEffect, useState } from "react";
import { bioPageUrl } from "@/features/bio/lib/bioOptions";
import type { PublicBioPage } from "@/features/bio/types";

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; page: PublicBioPage };

export function usePublicBioPage(slug: string | undefined): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!slug) {
      setState({ status: "missing" });
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(bioPageUrl(slug), { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const page = (await res.json()) as PublicBioPage;
        if (!controller.signal.aborted) setState({ status: "ready", page });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "missing" });
      });
    return () => controller.abort();
  }, [slug]);

  return state;
}
