import { Button, UnstyledButton } from "@mantine/core";
import { StepFooter } from "./StepFooter";
import {
  Search, Share2, PlayCircle, Mic, Radio, Newspaper, Users,
  Star, Megaphone, Mail, UserRound, MessageCircleMore, MoreHorizontal, Check,
} from "lucide-react";
import type { ReferralSource } from "@/shared/types";
import s from "./ReferralStep.module.css";


/* Colour sits on the icon and nowhere else. It is how you find the one you
   came from without reading all thirteen labels — but the tile's border and
   fill stay with the app's accent, so "selected" reads as one state across
   the grid rather than as thirteen different colours. */
export const REFERRAL_OPTIONS: { value: ReferralSource; label: string; icon: typeof Search; color: string }[] = [
  { value: "search", label: "Search engines", icon: Search, color: "#4285F4" },
  { value: "social", label: "Social media", icon: Share2, color: "#E1306C" },
  { value: "youtube", label: "YouTube", icon: PlayCircle, color: "#FF0000" },
  { value: "podcast", label: "Podcast or radio", icon: Mic, color: "#8B5CF6" },
  { value: "streaming", label: "Streaming platforms", icon: Radio, color: "#9146FF" },
  { value: "blog_article", label: "A blog or article", icon: Newspaper, color: "#F59E0B" },
  { value: "community", label: "A community", icon: Users, color: "#22C55E" },
  { value: "review_site", label: "A review site", icon: Star, color: "#EAB308" },
  { value: "online_ad", label: "An online ad", icon: Megaphone, color: "#F97316" },
  { value: "email", label: "Email", icon: Mail, color: "#06B6D4" },
  { value: "friend_colleague", label: "A friend or colleague", icon: UserRound, color: "#3B82F6" },
  { value: "word_of_mouth", label: "Word of mouth", icon: MessageCircleMore, color: "#EC4899" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "#94A3B8" },
];


export function ReferralStepBody({
  selected,
  onChange,
}: {
  selected: ReferralSource[];
  onChange: (next: ReferralSource[]) => void;
}) {
  const toggle = (value: ReferralSource) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div className={s.chips}>
      {REFERRAL_OPTIONS.map(({ value, label, icon: Icon, color }) => {
        const isSelected = selected.includes(value);
        return (
          <UnstyledButton
            key={value}
            className={`tile ${s.option}`}
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => toggle(value)}
          >
            {/* Left-aligned icon and label on one row, rather than a centred
                stack. These are thirteen sentences of varying length: centred,
                each sits at a different indent and the column has no edge to
                read down.

                The colour is set here rather than in CSS because it is data —
                it belongs to the option, and a stylesheet would need thirteen
                rules keyed on a value it should not have to know about. */}
            <Icon size={16} color={color} className={s.optionIcon} aria-hidden />
            <span className={s.optionLabel}>{label}</span>
            {/* Always in the DOM, faded when unselected: a tick that appears
                on click reflows nothing here, but reserving the box keeps the
                label's measure identical in both states, so text never
                re-wraps as you toggle. */}
            <Check size={13} strokeWidth={3} className={s.optionCheck} aria-hidden />
          </UnstyledButton>
        );
      })}
    </div>
  );
}

export function ReferralStepFooter({
  onBack,
  onSkip,
  onSubmit,
  selectedCount,
}: {
  /** Absent when this is the first screen of the flow. */
  onBack?: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  selectedCount: number;
}) {
  return (
    <StepFooter
      onBack={onBack}
      onSubmit={onSubmit}
      // Only while nothing is picked. Once an answer is selected, an opt-out
      // sitting beside Continue is a second button that throws the answer
      // away — and the one that reads as the quieter, safer choice of the two.
      secondary={
        selectedCount === 0 && (
          <Button size="sm" variant="subtle" color="gray" onClick={onSkip}>
            Prefer not to say
          </Button>
        )
      }
    />
  );
}
