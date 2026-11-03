import { FileSearch, Globe, Link2, ListOrdered, MousePointerClick, TrendingUp } from "lucide-react";
import { StartCard, StartSection, StartSteps } from "@/shared/ui/start/StartScreen";
import { ClicksPreview, IndexPreview, PagesPreview, QueriesPreview } from "./SearchPreviews";

export function SearchStartGuide() {
  return (
    <>
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
          title="Clicks and impressions"
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
          title="Indexing and sitemaps"
          text="Whether Google can find and index your pages, with sitemaps you can submit from here."
          preview={<IndexPreview />}
        />
      </StartSection>
    </>
  );
}
