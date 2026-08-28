import { Avatar, Badge, Box, Button, Group, Text } from "@mantine/core";
import { Trash2, Upload } from "lucide-react";
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
    clearAvatar,
  } = form;

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
    </Box>
  );
}
