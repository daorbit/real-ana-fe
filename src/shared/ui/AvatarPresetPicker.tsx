import { SimpleGrid, UnstyledButton, Image, Popover } from "@mantine/core";
import { PRESET_AVATARS } from "@/shared/lib/presetAvatars";

/**
 * A grid of ready-made avatars, for people who'd rather pick one than upload
 * a photo. Sits behind a popover next to the upload button — an equal, not a
 * fallback, since plenty of accounts never have a photo to give it.
 */
export function AvatarPresetPicker({
  opened,
  onClose,
  onPick,
  children,
}: {
  opened: boolean;
  onClose: () => void;
  onPick: (src: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Popover opened={opened} onClose={onClose} position="bottom-start" withArrow shadow="md" width={260}>
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown>
        <SimpleGrid cols={5} spacing={6}>
          {PRESET_AVATARS.map((src) => (
            <UnstyledButton
              key={src}
              onClick={() => onPick(src)}
              aria-label="Use this avatar"
              style={{ borderRadius: 8, overflow: "hidden", lineHeight: 0 }}
            >
              <Image src={src} alt="" w={40} h={40} radius={8} />
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Popover.Dropdown>
    </Popover>
  );
}
