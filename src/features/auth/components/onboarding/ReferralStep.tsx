import { Button, Group, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import {
  ArrowRight, Search, Share2, Youtube, Mic, Radio, Newspaper, Users,
  Star, Megaphone, Mail, UserRound, MessageCircleMore, MoreHorizontal, Check,
} from "lucide-react";
import type { ReferralSource } from "@/shared/types";

export const REFERRAL_OPTIONS: { value: ReferralSource; label: string; icon: typeof Search }[] = [
  { value: "search", label: "Search engines", icon: Search },
  { value: "social", label: "Social media", icon: Share2 },
  { value: "youtube", label: "YouTube", icon: Youtube },
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

/**
 * The "how did you hear about us" picker, as a tile grid rather than a list of
 * checkboxes — a plain checkbox list of thirteen rows read as a form to fill
 * in correctly, when the honest answer is just "tap whichever apply." Tiles
 * match the weight of the framework picker later in the same flow, so the two
 * multi/single-select steps in this flow don't look like two different apps.
 */
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
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
      {REFERRAL_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isSelected = selected.includes(value);
        return (
          <UnstyledButton
            key={value}
            className="tile onb-fw"
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => toggle(value)}
            style={{ position: "relative" }}
          >
            {isSelected && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "var(--accent-2)",
                  color: "#fff",
                }}
              >
                <Check size={11} strokeWidth={3} />
              </span>
            )}
            <Icon size={20} />
            <Text size="sm" fw={isSelected ? 600 : 500}>
              {label}
            </Text>
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
