import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { StartChips, StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { SeoReportFeatures } from "./SeoReportFeatures";

const QUICK_PATHS = [
  { label: "Homepage", value: "/" },
  { label: "/pricing", value: "/pricing" },
  { label: "/blog", value: "/blog" },
  { label: "/about", value: "/about" },
  { label: "/contact", value: "/contact" },
];

export function SeoStartPanel({
  domain,
  canEdit,
  path,
  onPath,
  inspectBar,
}: {
  domain: string;
  canEdit: boolean;
  path: string;
  onPath: (path: string) => void;
  inspectBar: ReactNode;
}) {
  return (
    <StartScreen>
      <StartHero
        id="seo-start-title"
        icon={<Search size={28} />}
        title={canEdit ? "Audit your first page" : "No audits yet"}
        text={
          canEdit
            ? `See how ${domain || "your site"} looks to Google — meta tags, content, technical setup and Lighthouse speed, in about 30 seconds.`
            : "Nobody has audited this site yet. Once an editor runs the first audit, the full report shows up here for everyone."
        }
      >
        {inspectBar}
        {canEdit && <StartChips label="Try" items={QUICK_PATHS} active={path} onPick={onPath} />}
      </StartHero>

      <SeoReportFeatures domain={domain} />
    </StartScreen>
  );
}
