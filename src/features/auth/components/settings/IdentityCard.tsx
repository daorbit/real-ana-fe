import { useState } from "react";
import { Avatar, Box, Button, Group, Text } from "@mantine/core";
import { Trash2, Images, Smile } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import { AvatarPresetPicker } from "@/shared/ui/AvatarPresetPicker";
import { useTranslation } from "react-i18next";
import type { ProfileForm } from "./useProfileForm";
import classes from "./Profile.module.css";

export function IdentityCard({ form }: { form: ProfileForm }) {
  const { t } = useTranslation();
  const {
    user,
    avatarBusy,
    avatarUrl,
    avatarBroken,
    setAvatarBroken,
    firstName,
    lastName,
    pickAvatarFromLibrary,
    clearAvatar,
  } = form;
  const [picking, setPicking] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  if (!user) return null;

  const initials =
    `${firstName} ${lastName}`.trim().slice(0, 2).toUpperCase() ||
    user.name.slice(0, 2).toUpperCase();

  return (
    <Box component="section" className={classes.identity} aria-label={t("settings.profile")}>
      <Box className={classes.identityBody}>
        <Avatar
          src={avatarBroken ? null : avatarUrl || null}
          radius="xl"
          size={72}
          className={classes.avatar}
          imageProps={{
            onError: () => setAvatarBroken(true),
            referrerPolicy: "no-referrer",
          }}
        >
          {initials}
        </Avatar>

        <Box className={classes.who}>
          <Group gap={10} wrap="nowrap">
            <Text className={classes.name} truncate>
              {`${firstName} ${lastName}`.trim() || user.name}
            </Text>
            <span className={classes.role}>{user.role.replace("_", " ")}</span>
          </Group>
          <Text size="sm" c="dimmed" truncate>
            {user.email}
          </Text>
        </Box>

        <Box className={classes.actions}>
          <Button
            size="xs"
            radius="md"
            variant="default"
            leftSection={<Images size={14} />}
            loading={avatarBusy}
            onClick={() => setPicking(true)}
          >
            {avatarUrl ? t("settings.avatarChange") : t("settings.avatarUpload")}
          </Button>
          <AvatarPresetPicker
            opened={presetOpen}
            onClose={() => setPresetOpen(false)}
            onPick={(src) => {
              setPresetOpen(false);
              void pickAvatarFromLibrary(src, "avatar");
            }}
          >
            <Button
              size="xs"
              radius="md"
              variant="default"
              leftSection={<Smile size={14} />}
              disabled={avatarBusy}
              onClick={() => setPresetOpen((v) => !v)}
            >
              {t("settings.avatarPreset", "Choose an avatar")}
            </Button>
          </AvatarPresetPicker>
          {avatarUrl && (
            <Button
              size="xs"
              radius="md"
              variant="subtle"
              color="red"
              leftSection={<Trash2 size={14} />}
              disabled={avatarBusy}
              onClick={() => void clearAvatar()}
            >
              {t("settings.avatarRemove")}
            </Button>
          )}
        </Box>
      </Box>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => void pickAvatarFromLibrary(asset.url, asset.name)}
        kind="image"
        title={t("settings.avatarPickerTitle", "Choose a profile photo")}
      />
    </Box>
  );
}
