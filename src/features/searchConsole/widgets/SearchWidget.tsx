import { Eye, Medal, MousePointerClick, Percent } from "lucide-react";
import { SearchKpiWidget } from "@/features/searchConsole/widgets/SearchKpiWidget";
import { SearchTrendWidget } from "@/features/searchConsole/widgets/SearchTrendWidget";
import { SearchTopWidget } from "@/features/searchConsole/widgets/SearchTopWidget";
import { SearchRankingsWidget } from "@/features/searchConsole/widgets/SearchRankingsWidget";
import { SearchOpportunitiesWidget } from "@/features/searchConsole/widgets/SearchOpportunitiesWidget";
import { useSearchWidgetSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import type { SearchSourceInput } from "@/features/searchConsole/widgets/useSearchWidgetSource";

export function SearchWidget({ id, ...input }: SearchSourceInput & { id: string }) {
  const source = useSearchWidgetSource(input);

  switch (id) {
    case "searchClicks":
      return <SearchKpiWidget metric="clicks" label="Google clicks" icon={MousePointerClick} source={source} />;
    case "searchImpressions":
      return <SearchKpiWidget metric="impressions" label="Google impressions" icon={Eye} source={source} />;
    case "searchCtr":
      return <SearchKpiWidget metric="ctr" label="Search CTR" icon={Percent} source={source} />;
    case "searchPosition":
      return <SearchKpiWidget metric="position" label="Avg. position" icon={Medal} source={source} />;
    case "searchTrend":
      return <SearchTrendWidget source={source} />;
    case "searchQueries":
      return <SearchTopWidget dimension="query" source={source} />;
    case "searchPages":
      return <SearchTopWidget dimension="page" source={source} />;
    case "searchRankings":
      return <SearchRankingsWidget source={source} />;
    case "searchOpportunities":
      return <SearchOpportunitiesWidget source={source} />;
    default:
      return null;
  }
}
