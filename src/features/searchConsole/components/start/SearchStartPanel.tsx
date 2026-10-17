import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { FileSearch, Globe, Link2, ListOrdered, MousePointerClick, Plus, TrendingUp } from "lucide-react";
import { StartCard, StartHero, StartScreen, StartSection, StartSteps } from "@/shared/ui/start/StartScreen";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { ClicksPreview, IndexPreview, PagesPreview, QueriesPreview } from "./SearchPreviews";

export function SearchStartPanel({ canEdit }: { canEdit: boolean }) {
  return (
    <StartScreen>
      <StartHero
        id="search-start-title"
        icon={<TrendingUp size={28} />}
        title="See how people find you on Google"
        text={
          canEdit
            ? "Add your website and connect Google Search Console to see the searches that bring visitors in, where you rank for them, and which pages Google has indexed, right next to your traffic."
            : "This workspace has no website yet. Once an editor adds one and connects Google Search Console, its search data shows up here for everyone."
        }
      >
        {canEdit && (
          <>
            <Button component={Link} to={ADD_SITE_PATH} size="md" color="emerald" leftSection={<Plus size={16} />}>
              Add your website
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Data comes straight from Google, and you can disconnect any time.
            </Text>
          </>
        )}
      </StartHero>

      <StartSteps
        label="How Search visibility works"
        steps={[
          { icon: <Globe size={15} />, title: "Add your website", text: "The site you want to see in Google results." },
          { icon: <Link2 size={15} />, title: "Connect Search Console", text: "Sign in with Google and pick the property for that site." },
          { icon: <TrendingUp size={15} />, title: "Watch your rankings", text: "Clicks, queries and pages fill in, and stay up to date on their own." },
        ]}
      />

      <StartSection
        id="search-start-features"
        title="What you'll see"
        sub="Everything Google knows about how your site performs in search, in one place."
      >
        <StartCard
          icon={<MousePointerClick size={14} />}
          title="Clicks & impressions"
          text="How often you appear in Google results and how often people click, day by day."
          preview={<ClicksPreview />}
        />
        <StartCard
          icon={<ListOrdered size={14} />}
          title="Top queries"
          text="The exact searches that bring people in, with your average position for each."
          preview={<QueriesPreview />}
        />
        <StartCard
          icon={<FileSearch size={14} />}
          title="Top pages"
          text="Which pages win the most search traffic, and which ones have room to climb."
          preview={<PagesPreview />}
        />
        <StartCard
          icon={<Globe size={14} />}
          title="Indexing & sitemaps"
          text="Whether Google can find and index your pages, with sitemaps you can submit from here."
          preview={<IndexPreview />}
        />
      </StartSection>
    </StartScreen>
  );
}
