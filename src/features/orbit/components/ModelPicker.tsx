import { ActionIcon, Menu, Text, Tooltip, UnstyledButton, Group } from "@mantine/core";
import { Check, ChevronDown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModelIcon } from "@/features/orbit/components/ModelIcon";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { useOrbitChat } from "@/features/orbit/useOrbitChat";

/**
 * Which model answers.
 *
 * Two shapes for two surfaces. In the 400px panel there is only room for the
 * model's glyph, so the trigger is an icon button; on the full page the
 * composer is wide enough to name the model, and a nameless icon there would be
 * a control nobody clicks because nobody knows what it is.
 *
 * Renders nothing when the server offers a single model — a picker with one
 * choice is a control that cannot do anything.
 */
export function ModelPicker({
  chat,
  variant,
  onNavigate,
}: {
  chat: ReturnType<typeof useOrbitChat>;
  /** `icon` for the floating panel, `labelled` for the full-page composer. */
  variant: "icon" | "labelled";
  /** Called before leaving for Billing, so a floating panel can close itself. */
  onNavigate?: () => void;
}) {
  const { models, model, setModel, plan } = chat;
  const navigate = useNavigate();

  if (models.length <= 1) return null;

  const active = models.find((m) => m.id === model);
  const activeLabel = active?.label ?? "default";

  const goToBilling = () => {
    onNavigate?.();
    navigate("/app/billing");
  };

  const trigger =
    variant === "icon" ? (
      <Tooltip label={`Model: ${activeLabel}`} withArrow position="top">
        <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Choose model">
          <ModelIcon id={model} size={16} />
        </ActionIcon>
      </Tooltip>
    ) : (
      <UnstyledButton
        aria-label={`Model: ${activeLabel}. Choose model`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderRadius: 8,
          color: "var(--mantine-color-dimmed)",
        }}
      >
        <ModelIcon id={model} size={15} />
        <Text size="xs" fw={500} lh={1}>
          {activeLabel}
        </Text>
        <ChevronDown size={12} />
      </UnstyledButton>
    );

  return (
    <Menu position="top-start" withArrow shadow="md" radius="md" width={262}>
      <Menu.Target>{trigger}</Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Answer with</Menu.Label>
        {models.map((m) => (
          <Menu.Item
            key={m.id}
            onClick={() => (m.locked ? goToBilling() : setModel(m.id))}
            leftSection={
              <span style={{ opacity: m.locked ? 0.4 : 1, display: "inline-flex" }}>
                <ModelIcon id={m.id} size={16} />
              </span>
            }
            rightSection={
              m.locked ? (
                <Lock size={12} style={{ opacity: 0.55 }} />
              ) : m.id === model ? (
                <Check size={13} />
              ) : undefined
            }
            // Without a bounded width the label section grows to fit its content
            // and `truncate` never engages.
            styles={{ itemLabel: { minWidth: 0 } }}
          >
            {/* Both lines truncate rather than wrap. A menu where one row is
                twice the height of its neighbours stops being scannable, which
                is the only reason to have icons. */}
            <Text
              size="sm"
              fw={m.id === model ? 600 : 400}
              lh={1.3}
              c={m.locked ? "dimmed" : undefined}
              truncate
            >
              {m.label}
            </Text>
            <Text size="xs" c={m.locked ? "emerald.5" : "dimmed"} lh={1.35} truncate>
              {m.locked ? "Out of questions" : m.hint}
            </Text>
          </Menu.Item>
        ))}

        {/* Every row locks together, so this only needs to say what to do about
            it, not which model it unlocks. */}
        {models.some((m) => m.locked) && (
          <>
            <Menu.Divider />
            <Menu.Item leftSection={<OrbitMark size={14} />} onClick={goToBilling}>
              <Group gap={0}>
                <Text size="xs" c="dimmed" lh={1.35}>
                  {plan?.name ?? "Your plan"} is out of questions this period. Upgrade or buy a
                  pack
                </Text>
              </Group>
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
