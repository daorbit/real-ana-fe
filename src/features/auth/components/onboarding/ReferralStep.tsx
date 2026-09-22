import { Button, Group, SimpleGrid, UnstyledButton } from "@mantine/core";
import {
  ArrowRight, Search, Share2, PlayCircle, Mic, Radio, Newspaper, Users,
  Star, Megaphone, Mail, UserRound, MessageCircleMore, MoreHorizontal, Check,
} from "lucide-react";
import type { ReferralSource } from "@/shared/types";
import s from "./ReferralStep.module.css";

/**
 * The options, without per-option colours.
 *
 * Each of these used to carry a saturated brand hex — Google blue, YouTube
 * red, Instagram pink — painting thirteen different colours across one grid.
 * Three things were wrong with it: the colours are the *referrer's* brand on a
 * screen that is entirely Quantalog's; thirteen competing hues give the eye no
 * order to read them in, so the grid scans as a toy rather than a question;
 * and colour was carrying selection at the same time, which left "selected"
 * looking like nothing more than "this tile is pink".
 *
 * Selection is now the one accent on the screen, applied by `.tile` through
 * `data-selected` like every other selectable surface in the app.
 */
export const REFERRAL_OPTIONS: { value: ReferralSource; label: string; icon: typeof Search }[] = [
  { value: "search", label: "Search engines", icon: Search },
  { value: "social", label: "Social media", icon: Share2 },
  { value: "youtube", label: "YouTube", icon: PlayCircle },
  { value: "podcast", label: "Podcast or radio", icon: Mic },
  { value: "streaming", label: "Streaming platforms", icon: Radio },
  { value: "blog_article", label: "A blog or article", icon: Newspaper },
  { value: "community", label: "A community", icon: Users },
  { value: "review_site", label: "A review site", icon: Star },
  { value: "online_ad", label: "An online ad", icon: Megaphone },
  { value: "email", label: "Email", icon: Mail },
  { value: "friend_colleague", label: "A friend or colleague", icon: UserRound },
  { value: "word_of_mouth", label: "Word of mouth", icon: MessageCircleMore },
  { value: "other", label: "Other", icon: MoreHorizontal },
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
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={8}>
      {REFERRAL_OPTIONS.map(({ value, label, icon: Icon }) => {
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
                read down. */}
            <Icon size={16} className={s.optionIcon} aria-hidden />
            <span className={s.optionLabel}>{label}</span>
            {/* Always in the DOM, faded when unselected: a tick that appears
                on click reflows nothing here, but reserving the box keeps the
                label's measure identical in both states, so text never
                re-wraps as you toggle. */}
            <Check size={13} strokeWidth={3} className={s.optionCheck} aria-hidden />
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );
}

export function ReferralStepFooter({
  onSkip,
  onSubmit,
}: {
  onSkip: () => void;
  onSubmit: () => void;
}) {
  return (
    <Group justify="flex-end" gap="sm">
      <Button variant="subtle" color="gray" onClick={onSkip}>
        Prefer not to say
      </Button>
      <Button
        className="auth-btn"
        size="md"
        onClick={onSubmit}
        rightSection={<ArrowRight size={16} />}
      >
        Continue
      </Button>
    </Group>
  );
}
