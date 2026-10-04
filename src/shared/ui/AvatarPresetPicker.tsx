import { UnstyledButton, Popover } from "@mantine/core";
import { PRESET_AVATARS } from "@/shared/lib/presetAvatars";
import classes from "./AvatarPresetPicker.module.css";

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
    <Popover opened={opened} onClose={onClose} position="bottom-start" withArrow shadow="md" width={312}>
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown>
        <div className={classes.scroll}>
          <div className={classes.grid}>
            {PRESET_AVATARS.map((src, i) => (
              <UnstyledButton
                key={src}
                className={classes.option}
                onClick={() => onPick(src)}
                aria-label={`Use avatar ${i + 1}`}
              >
                <img src={src} alt="" loading="lazy" className={classes.image} />
              </UnstyledButton>
            ))}
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
