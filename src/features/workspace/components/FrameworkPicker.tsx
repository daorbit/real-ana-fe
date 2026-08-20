import { SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import {
  FRAMEWORK_GROUPS, frameworksInGroup, type FrameworkId,
} from "@/features/workspace/frameworks";

/**
 * The "what is it built with?" tile grid, shared by the onboarding flow and
 * the add-site wizard.
 *
 * Shelved by group rather than laid out as one long grid. The list started at
 * eight and is now closer to twenty, and past a certain length an unbroken
 * wall of logos stops being a picker and starts being a search task — the
 * groups are the same distinction the guides already make, between code you
 * write and a settings box you paste into.
 */
export function FrameworkPicker({
  value, onChange,
}: {
  value: FrameworkId;
  onChange: (id: FrameworkId) => void;
}) {
  return (
    <Stack gap="md">
      {FRAMEWORK_GROUPS.map((group) => {
        const guides = frameworksInGroup(group.id);
        if (guides.length === 0) return null;

        return (
          <Stack key={group.id} gap={6}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.4}>
              {group.label}
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {guides.map((f) => (
                <UnstyledButton
                  key={f.id}
                  className="onb-fw tile"
                  data-selected={value === f.id}
                  aria-pressed={value === f.id}
                  onClick={() => onChange(f.id)}
                >
                  <BrandIcon framework={f.id} size={22} />
                  <Text size="sm" fw={value === f.id ? 600 : 500}>
                    {f.label}
                  </Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </Stack>
        );
      })}
    </Stack>
  );
}
