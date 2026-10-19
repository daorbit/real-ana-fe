import { useState } from "react";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import type { useAiAssistants } from "../../hooks/useAiAssistants";
import type { AssistantId } from "../../lib/aiAssistants";
import { CATEGORY_HINT, CATEGORY_TITLE } from "../../lib/catalog";
import { matchesFilter, type ConnectionFilter } from "../../lib/filter";
import { IntegrationTileCard } from "../IntegrationTileCard";
import { AssistantModal } from "./AssistantModal";

interface Props {
  assistants: ReturnType<typeof useAiAssistants>;
  workspaceName: string;
  lockedReason?: string;
  filter: ConnectionFilter;
  flat?: boolean;
}

export function AiAssistantsConnection({ assistants, workspaceName, lockedReason, filter, flat }: Props) {
  const [openId, setOpenId] = useState<AssistantId | null>(null);

  if (!assistants.available) return null;

  const visible = assistants.items.filter((item) => matchesFilter(item.entry, filter));
  const open = assistants.items.find((item) => item.info.id === openId);

  const cards = visible.map((item) => (
    <IntegrationTileCard
      key={item.info.id}
      tile={item.tile}
      busy={assistants.loading}
      lockedReason={lockedReason}
      onOpen={() => setOpenId(item.info.id)}
    />
  ));

  return (
    <>
      {visible.length > 0 &&
        (flat ? (
          cards
        ) : (
          <ConnectionGroup title={CATEGORY_TITLE.ai} hint={CATEGORY_HINT.ai}>
            {cards}
          </ConnectionGroup>
        ))}
      {open && (
        <AssistantModal
          opened
          info={open.info}
          workspaceName={workspaceName}
          mcpUrl={assistants.mcpUrl}
          connections={open.connections}
          revokingId={assistants.revokingId}
          onClose={() => setOpenId(null)}
          onRefresh={assistants.refresh}
          onDisconnect={assistants.disconnect}
        />
      )}
    </>
  );
}
