import { Button, Group, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import {
  ArrowRight, Search, Share2, PlayCircle, Mic, Radio, Newspaper, Users,
  Star, Megaphone, Mail, UserRound, MessageCircleMore, MoreHorizontal, Check,
} from "lucide-react";
import type { ReferralSource } from "@/shared/types";

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
  { value: "other", label: "Other", icon: MoreHorizontal, color: "#6B7280" },
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
    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
      {REFERRAL_OPTIONS.map(({ value, label, icon: Icon, color }) => {
        const isSelected = selected.includes(value);
        return (
          <UnstyledButton
            key={value}
            className="tile onb-fw"
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => toggle(value)}
            style={{
              position: "relative",
              ...(isSelected
                ? {
                    borderColor: color,
                    background: `color-mix(in srgb, ${color} 14%, transparent)`,
                  }
                : undefined),
            }}
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
                  background: color,
                  color: "#fff",
                }}
              >
                <Check size={11} strokeWidth={3} />
              </span>
            )}
            <Icon size={20} color={color} />
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
