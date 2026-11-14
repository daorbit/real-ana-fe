import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import type { BioPage, BioPageKind } from "@/features/bio/types";

export function useBioAllowances(pages: BioPage[]) {
  const profiles = pages.filter((p) => p.kind !== "release").length;
  const releases = pages.length - profiles;
  const profile = useFeatureAllowance("bioPages", profiles);
  const release = useFeatureAllowance("smartLinks", releases);
  return { profile, release, of: (kind: BioPageKind) => (kind === "release" ? release : profile) };
}
