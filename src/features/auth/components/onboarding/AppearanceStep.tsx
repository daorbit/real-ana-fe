import { Button, Group, Text, Title } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";

export function AppearanceStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  return (
    <div className="onb-appearance-page">
      <Group justify="space-between" mb="lg" wrap="wrap">
        <div>
          <Title order={2} style={{ letterSpacing: "-0.02em" }}>
            Make it yours
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Pick a mode, an accent, and a background — you can change any of
            it later from Settings.
          </Text>
        </div>
        <Group gap="sm">
          <Button className="auth-btn" variant="default" leftSection={<ArrowLeft size={15} />} onClick={onBack}>
            Back
          </Button>
          <Button className="auth-btn" onClick={onDone} rightSection={<ArrowRight size={16} />}>
            Continue
          </Button>
        </Group>
      </Group>

      <AppearanceSection bare />
    </div>
  );
}
