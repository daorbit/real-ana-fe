import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { Plus, TrendingUp } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { SearchStartGuide } from "./SearchStartGuide";

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
            <Button component={Link} to={ADD_SITE_PATH} size="md" radius="xl" leftSection={<Plus size={16} />}>
              Add your website
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Data comes straight from Google, and you can disconnect any time.
            </Text>
          </>
        )}
      </StartHero>

      <SearchStartGuide />
    </StartScreen>
  );
}
