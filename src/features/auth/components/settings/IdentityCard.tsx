import { useState } from "react";
import { Avatar, Badge, Box, Button, Group, Text } from "@mantine/core";
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
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <Box component="section" className={classes.identity}>
      <Box className={classes.cover} />
      <Box className={classes.identityBody}>
        <Box className={classes.avatarWrap}>
          <Avatar
            src={avatarBroken ? null : avatarUrl || null}
            color="emerald"
            radius={16}
            size={84}
            imageProps={{
              onError: () => setAvatarBroken(true),
              referrerPolicy: "no-referrer",
            }}
          >
            {initials}
          </Avatar>
        </Box>

        <Box className={classes.who}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={700} size="lg" truncate>
              {`${firstName} ${lastName}`.trim() || user.name}
            </Text>
            <Badge size="sm" variant="light" color={isAdmin ? "grape" : "gray"} tt="capitalize">
              {user.role.replace("_", " ")}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" truncate>
            {user.email}
          </Text>
        </Box>

        <Box className={classes.actions}>
          <Button
            size="xs"
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
