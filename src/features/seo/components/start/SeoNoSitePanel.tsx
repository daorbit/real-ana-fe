import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { Globe, ListChecks, Plus, Search, Wrench } from "lucide-react";
import { StartHero, StartScreen, StartSteps } from "@/shared/ui/start/StartScreen";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { SeoReportFeatures } from "./SeoReportFeatures";

export function SeoNoSitePanel({ canEdit }: { canEdit: boolean }) {
  return (
    <StartScreen>
      <StartHero
        id="seo-nosite-title"
        icon={<Search size={28} />}
        title="Find what's holding your site back on Google"
        text={
          canEdit
            ? "Add your website and Quantalog audits any page in about 30 seconds: meta tags, content, technical setup and real Lighthouse speed, with a fix for everything that's off."
            : "This workspace has no website yet. Once an editor adds one, anyone here can audit its pages."
        }
      >
        {canEdit && (
          <>
            <Button component={Link} to={ADD_SITE_PATH} size="md" color="emerald" leftSection={<Plus size={16} />}>
              Add your website
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              No code needed to audit. Just the address of the site.
            </Text>
          </>
        )}
      </StartHero>

      <StartSteps
        label="How SEO audits work"
        steps={[
          { icon: <Globe size={15} />, title: "Add your website", text: "Tell Quantalog the address. It works for any public site." },
          { icon: <ListChecks size={15} />, title: "Audit a page", text: "Pick the homepage or any URL and get a full report in about 30 seconds." },
          { icon: <Wrench size={15} />, title: "Fix what matters", text: "Issues are ranked by impact, each with a plain-English fix." },
        ]}
      />

      <SeoReportFeatures domain="yoursite.com" />
    </StartScreen>
  );
}
