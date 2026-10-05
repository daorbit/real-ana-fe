import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { Plus, Search, Swords } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
// import { CompareSample } from "./CompareSample";

export type CompareStage = "noSite" | "needsAudit" | "ready";

const COPY: Record<CompareStage, { title: string; text: (domain: string) => string }> = {
  noSite: {
    title: "Compare your pages with competitors",
    text: () => "Add your site first. A comparison needs a page of your own to measure every competitor against.",
  },
  needsAudit: {
    title: "First, audit your own page",
    text: (domain) =>
      `Competitors are measured against your page, so ${domain} needs one SEO audit as a baseline. It takes about 30 seconds.`,
  },
  ready: {
    title: "See where competitors beat you",
    text: (domain) =>
      `Paste a competitor's page and Quantalog compares it with ${domain} — the sections they cover, the schema they mark up and the terms your page never mentions.`,
  },
};

export function CompareStartPanel({
  stage,
  domain,
  canEdit,
  addForm,
  max,
}: {
  stage: CompareStage;
  domain: string;
  canEdit: boolean;
  addForm: ReactNode;
  max: number;
}) {
  const copy = COPY[stage];
  const viewerReady = stage === "ready" && !canEdit;

  return (
    <StartScreen>
      <StartHero
        id="compare-start-title"
        icon={<Swords size={28} />}
        title={viewerReady ? "Nothing to compare yet" : copy.title}
        text={
          viewerReady
            ? "Nobody has tracked a competitor for this site yet. An editor can add one, and the comparison shows up here for everyone."
            : copy.text(domain || "your site")
        }
      >
        {stage === "noSite" && (
          <Button component={Link} to={ADD_SITE_PATH} size="md" color="emerald" leftSection={<Plus size={16} />}>
            Add a site
          </Button>
        )}
        {stage === "needsAudit" && (
          <Button component={Link} to="/app/seo" size="md" color="emerald" leftSection={<Search size={16} />}>
            Run an SEO audit
          </Button>
        )}
        {stage === "ready" && canEdit && (
          <>
            {addForm}
            <Text size="xs" c="dimmed" ta="center">
              Track up to {max} competitor pages for this site. Each one is re-checked when you compare again.
            </Text>
          </>
        )}
      </StartHero>

      {/* <CompareSample domain={domain} /> */}
    </StartScreen>
  );
}
