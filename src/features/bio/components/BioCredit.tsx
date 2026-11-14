import { SITE_URL } from "@/shared/lib/docsSlugs";

export function BioCredit({ className, interactive }: { className: string; interactive: boolean }) {
  return (
    <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className={className} tabIndex={interactive ? 0 : -1}>
      Made with Quantalog
    </a>
  );
}
