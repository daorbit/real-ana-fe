import { useMemo } from "react";
import { useGetInstagramStatusQuery, useGetLinkedInStatusQuery } from "@/app/store";
import { useCanUseInstagram } from "@/features/auth/context";
import type { ConnectionState, Searchable } from "../lib/filter";

export type SocialId = "linkedin" | "instagram" | "facebook";

export interface SocialEntry extends Searchable {
  id: SocialId;
}

export const SOCIAL_GROUP = "Social publishing";

interface SocialStatus {
  connected?: boolean;
  expired?: boolean;
  canPublish?: boolean;
}

function socialState(status: SocialStatus | undefined): ConnectionState {
  if (!status?.connected) return "available";
  if (status.expired || status.canPublish === false) return "attention";
  return "connected";
}

export function useSocialConnections(): { entries: SocialEntry[]; canUseInstagram: boolean; loading: boolean } {
  const canUseInstagram = useCanUseInstagram();
  const { data: linkedIn, isLoading: linkedInLoading } = useGetLinkedInStatusQuery();
  const { data: instagram, isLoading: instagramLoading } = useGetInstagramStatusQuery(undefined, {
    skip: !canUseInstagram,
  });

  const entries = useMemo<SocialEntry[]>(
    () => [
      {
        id: "linkedin",
        name: "LinkedIn",
        description: "Publishing account for scheduled social posts.",
        group: SOCIAL_GROUP,
        state: socialState(linkedIn),
      },
      {
        id: "instagram",
        name: "Instagram",
        description: "Feed posts from the same composer.",
        group: SOCIAL_GROUP,
        state: canUseInstagram ? socialState(instagram) : "soon",
      },
      {
        id: "facebook",
        name: "Facebook",
        description: "Pages and profile posting.",
        group: SOCIAL_GROUP,
        state: "soon",
      },
    ],
    [linkedIn, instagram, canUseInstagram],
  );

  return { entries, canUseInstagram, loading: linkedInLoading || instagramLoading };
}
