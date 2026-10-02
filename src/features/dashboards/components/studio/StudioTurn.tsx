import { UnstyledButton } from "@mantine/core";
import { Eye } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { RichText } from "@/features/orbit/components/RichText";
import { useTypewriter } from "@/features/orbit/useTypewriter";
import { OrbitChatTurn } from "@/features/searchConsole/components/OrbitChatTurn";
import { ProposalChanges } from "@/features/dashboards/components/studio/ProposalChanges";
import { draftChanges } from "@/features/dashboards/draftChanges";
import type { DashboardDraft } from "@/features/dashboards/types";
import type { DashboardOrbitMessage } from "@/features/dashboards/hooks/useDashboardOrbit";
import chat from "@/features/searchConsole/components/orbitChat.module.css";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

type TurnProps = {
  message: DashboardOrbitMessage;
  live: boolean;
  isLast: boolean;
  thinking: boolean;
  selected: boolean;
  onSelect: () => void;
  onRevealed: () => void;
  onRegenerate: () => void;
  onEdit: (text: string) => void;
};

function VersionTurn({
  message,
  live,
  selected,
  onSelect,
  onRevealed,
}: TurnProps & { message: DashboardOrbitMessage & { draft: DashboardDraft } }) {
  const shown = useTypewriter(message.content, live, onRevealed);
  const changes = draftChanges(message.base, message.draft);

  return (
    <div className={classes.turn}>
      <div className={chat.answer}>
        <div className={chat.answerHead}>
          <OrbitMark size={20} />
          <span className={chat.answerName}>Orbit</span>
        </div>
        <div className={chat.answerBody}>
          <RichText text={shown} animate={live} />
        </div>
      </div>
      {!live && (
        <>
          <ProposalChanges changes={changes} />
          <div className={classes.turnMeta}>
            <span>
              Version {message.version ?? 1} · {message.draft.layout.length} widgets
            </span>
            {selected ? (
              <span className={classes.viewing}><Eye size={13} /> In preview</span>
            ) : (
              <UnstyledButton className={classes.showVersion} onClick={onSelect}>
                <Eye size={13} /> Show this version
              </UnstyledButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function StudioTurn(props: TurnProps) {
  const { message } = props;
  if (message.role === "assistant" && message.draft) {
    return <VersionTurn {...props} message={{ ...message, draft: message.draft }} />;
  }
  return (
    <OrbitChatTurn
      message={message}
      live={props.live}
      isLast={props.isLast}
      busy={props.thinking}
      onRevealed={props.onRevealed}
      onRegenerate={props.onRegenerate}
      onEdit={props.onEdit}
    />
  );
}
