import { useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { InstagramTileFooter, LinkedInTileFooter } from "./SocialTileFooters";
import { ConnectionCard, type ConnectionCardStatus } from "@/features/auth/components/settings/ConnectionCard";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import { FacebookMark, InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { SocialEntry, SocialId } from "../../hooks/useSocialConnections";
import { useJustConnected } from "../../hooks/useJustConnected";
import type { ConnectionState } from "../../lib/filter";
import { appGuideUrl } from "../../lib/links";
import { CARD_MARK_SIZE } from "../logos/BrandMarks";

interface Props {
  entries: SocialEntry[];
  canUseInstagram: boolean;
  flat?: boolean;
}

function statusFor(state: ConnectionState | undefined): ConnectionCardStatus {
  if (state === "connected") return "connected";
  if (state === "attention") return "attention";
  return "idle";
}

export function SocialGroup({ entries, canUseInstagram, flat }: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const linkedInStatus = statusFor(entries.find((e) => e.id === "linkedin")?.state);
  const instagramStatus = statusFor(entries.find((e) => e.id === "instagram")?.state);
  const linkedInCelebrate = useJustConnected(linkedInStatus === "connected");
  const instagramCelebrate = useJustConnected(instagramStatus === "connected");
  const goToSocial = useCallback(() => nav("/app/social"), [nav]);
  if (entries.length === 0) return null;

  const cards: Record<SocialId, ReactNode> = {
    linkedin: (
      <ConnectionCard
        key="linkedin"
        mark={<LinkedInMark size={CARD_MARK_SIZE} />}
        brand="linkedin"
        name="LinkedIn"
        hint="Publishing account for scheduled social posts."
        docsUrl={appGuideUrl("linkedin")}
        status={linkedInStatus}
        celebrate={linkedInCelebrate}
      >
        <LinkedInTileFooter celebrate={linkedInCelebrate} onConnected={goToSocial} />
      </ConnectionCard>
    ),
    instagram: (
      <ConnectionCard
        key="instagram"
        mark={<InstagramMark size={CARD_MARK_SIZE} />}
        brand="instagram"
        name="Instagram"
        hint="Feed posts from the same composer."
        soon={!canUseInstagram}
        docsUrl={canUseInstagram ? appGuideUrl("instagram") : undefined}
        status={canUseInstagram ? instagramStatus : undefined}
        celebrate={instagramCelebrate}
      >
        {canUseInstagram && <InstagramTileFooter celebrate={instagramCelebrate} onConnected={goToSocial} />}
      </ConnectionCard>
    ),
    facebook: (
      <ConnectionCard key="facebook" mark={<FacebookMark size={CARD_MARK_SIZE} />} brand="facebook" name="Facebook" hint="Pages and profile posting." soon />
    ),
  };

  if (flat) return <>{entries.map((entry) => cards[entry.id])}</>;

  return (
    <ConnectionGroup
      title={t("settings.socialGroupTitle", "Social publishing")}
      hint={t("settings.connectionsHint", "Networks Quantalog can publish your scheduled posts to.")}
    >
      {entries.map((entry) => cards[entry.id])}
    </ConnectionGroup>
  );
}
