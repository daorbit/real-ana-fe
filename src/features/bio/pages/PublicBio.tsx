import { Loader } from "@mantine/core";
import { Link2Off } from "lucide-react";
import { useParams } from "react-router-dom";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { usePublicBioPage } from "@/features/bio/hooks/usePublicBioPage";
import { bioClickUrl } from "@/features/bio/lib/bioOptions";
import { BioView } from "@/features/bio/components/BioView";
import classes from "@/features/bio/components/PublicBio.module.css";

export default function PublicBio() {
  const { slug } = useParams<{ slug: string }>();
  const state = usePublicBioPage(slug?.toLowerCase());
  useTitle(state.status === "ready" ? state.page.title : "Link in bio");

  if (state.status === "loading") {
    return (
      <div className={classes.center}>
        <Loader size="sm" />
      </div>
    );
  }

  if (state.status === "missing") {
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

  const { page } = state;
  return (
    <div className={classes.page}>
      <BioView
        title={page.title}
        bio={page.bio}
        avatarUrl={page.avatarUrl}
        links={page.links}
        socials={page.socials}
        theme={page.theme}
        linkHref={(link) => bioClickUrl(page.slug, link.id)}
      />
    </div>
  );
}
