import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FormModal } from "@/shared/ui/FormModal";
import { ORBIT_FEEDBACK_FORM_URL } from "@/shared/lib/formLinks";

type Vote = "up" | "down";

const VOTES: { value: Vote; label: string; Icon: typeof ThumbsUp }[] = [
  { value: "up", label: "Good response", Icon: ThumbsUp },
  { value: "down", label: "Bad response", Icon: ThumbsDown },
];

export function FeedbackButtons() {
  const [vote, setVote] = useState<Vote | null>(null);
  const [open, setOpen] = useState(false);

  const pick = (value: Vote) => {
    setVote(value);
    setOpen(true);
  };

  return (
    <>
      {VOTES.map(({ value, label, Icon }) => (
        <Tooltip key={value} label={label} withArrow>
          <ActionIcon
            variant="subtle"
            color={vote === value ? "emerald" : "gray"}
            size="sm"
            radius="xl"
            onClick={() => pick(value)}
            aria-label={label}
            aria-pressed={vote === value}
          >
            <Icon size={13} />
          </ActionIcon>
        </Tooltip>
      ))}
      <FormModal
        opened={open}
        onClose={() => setOpen(false)}
        title="Share feedback on this answer"
        url={ORBIT_FEEDBACK_FORM_URL}
      />
    </>
  );
}
