import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useOrbitOptional } from "@/features/orbit/components/OrbitProvider";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

 
export function AskOrbitButton({
  question,
  label = "Ask Orbit",
  size = "compact-xs",
  iconOnly = false,
}: {
  /** Asked verbatim. Write it as the user would, so the reply reads as a reply. */
  question: string;
  label?: string;
  size?: "compact-xs" | "xs" | "sm";
  /** Renders the mark alone, for dense rows where a labelled button would not fit. */
  iconOnly?: boolean;
}) {
  // Optional, because these panels are shared with the public shared-report
  // page and the print view, which render outside the provider for someone with
  // no account at all.
  const orbit = useOrbitOptional();
  const navigate = useNavigate();

  // Nothing to open when there is no assistant here, or the server has no
  // model configured. Hiding the button is better than offering an action that
  // opens an apology.
  if (!orbit?.chat.available) return null;

  const { chat } = orbit;

  // Straight to Orbit's page, question and all. The conversation is owned by
  // the provider above the route, so navigating does not lose it — the question
  // is already in flight by the time the page paints, and the answer lands in a
  // thread the user is looking at.
  //
  // These sit inside accordion controls and clickable rows; without the
  // stopPropagation the click also toggles whatever is behind them.
  const ask = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/app/orbit");
    chat.send(question);
  };

  if (iconOnly) {
    return (
      <Tooltip label={label} withArrow position="left">
        <ActionIcon
          className="no-print"
          variant="subtle"
          color="emerald"
          size="sm"
          disabled={chat.thinking}
          onClick={ask}
          aria-label={label}
        >
          <OrbitMark size={14} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Tooltip label="Get step-by-step help with this" withArrow position="top">
      <Button
        // The SEO panels are also what the print stylesheet renders, and a
        // button on paper is an instruction nobody can follow.
        className="no-print"
        size={size}
        variant="light"
        color="emerald"
        leftSection={<OrbitMark size={14} />}
        // `send` ignores a question while one is in flight, which is right —
        // queueing them would answer the second into a conversation the user
        // has not read yet. Disabling says so instead of looking broken.
        disabled={chat.thinking}
        onClick={ask}
      >
        {label}
      </Button>
    </Tooltip>
  );
}
