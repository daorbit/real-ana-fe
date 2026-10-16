import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LinkedInConnection } from "@/features/analytics/components/LinkedInConnection";
import { InstagramConnection } from "@/features/social/components/InstagramConnection";
import { ConnectionCard } from "@/features/auth/components/settings/ConnectionCard";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import { FacebookMark, InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";
import type { SocialEntry, SocialId } from "../../hooks/useSocialConnections";
import { appGuideUrl } from "../../lib/links";
import { CARD_MARK_SIZE } from "../logos/BrandMarks";

interface Props {
  entries: SocialEntry[];
  canUseInstagram: boolean;
  flat?: boolean;
}

export function SocialGroup({ entries, canUseInstagram, flat }: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
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
      >
        <LinkedInConnection onConnected={() => nav("/app/social")} />
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
      >
        {canUseInstagram && <InstagramConnection onConnected={() => nav("/app/social")} />}
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
