import { Button, Checkbox, Group, Stack } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import type { ReferralSource } from "@/shared/types";

export const REFERRAL_OPTIONS: { value: ReferralSource; label: string }[] = [
  { value: "search", label: "Search engines (Google, Bing, etc.)" },
  { value: "social", label: "Social media (X, LinkedIn, Instagram, etc.)" },
  { value: "youtube", label: "YouTube" },
  { value: "podcast", label: "Podcast or radio" },
  { value: "streaming", label: "Streaming platforms (Twitch, YouTube Live, etc.)" },
  { value: "blog_article", label: "A blog or article" },
  { value: "community", label: "A community (Reddit, Discord, Slack, etc.)" },
  { value: "review_site", label: "A review site (G2, Capterra, etc.)" },
  { value: "online_ad", label: "An online ad" },
  { value: "email", label: "Email" },
  { value: "friend_colleague", label: "A friend or colleague" },
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "other", label: "Other" },
];

/** Title and lede live on the shell — this is the step's controls only. */
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
    <Stack gap="xs">
      {REFERRAL_OPTIONS.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={selected.includes(opt.value)}
          onChange={() => toggle(opt.value)}
          size="md"
        />
      ))}
    </Stack>
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
        Skip
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
