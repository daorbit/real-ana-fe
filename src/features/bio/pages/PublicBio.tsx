import { Link2Off } from "lucide-react";
import { useParams } from "react-router-dom";
import { EmptyState } from "@/shared/ui/EmptyState";
import { BioPageLoader } from "@/features/bio/components/BioPageLoader";
import { useTitle } from "@/shared/lib/useTitle";
import { usePublicBioPage } from "@/features/bio/hooks/usePublicBioPage";
import { useBioBeacon } from "@/features/bio/hooks/useBioBeacon";
import { BioPageView } from "@/features/bio/components/BioPageView";
import classes from "@/features/bio/components/PublicBio.module.css";

export default function PublicBio() {
  const { slug } = useParams<{ slug: string }>();
  const state = usePublicBioPage(slug?.toLowerCase());
  const page = state.status === "ready" ? state.page : null;
  const trackClick = useBioBeacon(page?.slug ?? null);
  useTitle(page ? page.title : "Quantalog");

  if (state.status === "loading") return <BioPageLoader />;

  if (!page) {
    return (
      <div className={classes.center}>
        <EmptyState
          icon={Link2Off}
          title="This page isn't available"
          description="The link may be mistyped, or the page has been unpublished."
          compact
        />
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <BioPageView page={page} onLinkClick={trackClick} />
    </div>
  );
}
