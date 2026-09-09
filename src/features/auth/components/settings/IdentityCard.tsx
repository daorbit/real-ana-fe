import { useState } from "react";
import { Avatar, Badge, Box, Button, Group, Text } from "@mantine/core";
import { Trash2, Upload, Images } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import { useTranslation } from "react-i18next";
import type { ProfileForm } from "./useProfileForm";

export function IdentityCard({ form }: { form: ProfileForm }) {
  const { t } = useTranslation();
  const {
    user,
    fileInput,
    avatarBusy,
    avatarUrl,
    avatarBroken,
    setAvatarBroken,
    firstName,
    lastName,
    pickAvatar,
    pickAvatarFromLibrary,
    clearAvatar,
  } = form;
  const [picking, setPicking] = useState(false);

  if (!user) return null;

  const initials =
    `${firstName} ${lastName}`.trim().slice(0, 2).toUpperCase() ||
    user.name.slice(0, 2).toUpperCase();

  return (
    <Box className="surface-card" p="lg">
      <Group gap="lg" wrap="nowrap">
        <Avatar
          src={avatarBroken ? null : avatarUrl || null}
          color="emerald"
          radius="md"
          size={72}
          imageProps={{
            onError: () => setAvatarBroken(true),
            referrerPolicy: "no-referrer",
          }}
        >
          {initials}
        </Avatar>
        <Box style={{ minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={700} size="lg" truncate style={{ letterSpacing: "-0.01em" }}>
              {`${firstName} ${lastName}`.trim() || user.name}
            </Text>
            <Badge
              size="sm"
              variant="light"
              color={
                user.role === "admin" || user.role === "super_admin"
                  ? "grape"
                  : "gray"
              }
            >
              {user.role}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" truncate>
            {user.email}
          </Text>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => pickAvatar(e.currentTarget.files?.[0] ?? null)}
          />
          <Group gap="xs" mt="sm">
            <Button
              size="xs"
              variant="light"
              leftSection={<Upload size={14} />}
              loading={avatarBusy}
              onClick={() => fileInput.current?.click()}
            >
              {avatarUrl ? t("settings.avatarChange") : t("settings.avatarUpload")}
            </Button>
            {/* The workspace's own files, as an alternative to a fresh upload.
                Either way it goes through the cropper — an avatar is square
                wherever it is shown. */}
            <Button
              size="xs"
              variant="light"
              leftSection={<Images size={14} />}
              disabled={avatarBusy}
              onClick={() => setPicking(true)}
            >
              From media
            </Button>
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
          </Group>
        </Box>
      </Group>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => void pickAvatarFromLibrary(asset.url, asset.name)}
        kind="image"
        title="Choose a profile photo"
      />
    </Box>
  );
}
