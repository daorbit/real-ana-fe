import { useEffect, useRef, useState } from "react";
import {
  Button, Group, Text, TextInput, Stack, Avatar, ActionIcon,
} from "@mantine/core";
import { ArrowRight, Camera, Sparkles, Trash2, UserRound } from "lucide-react";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { AvatarPresetPicker } from "@/shared/ui/AvatarPresetPicker";
import { PhoneInput, joinNumber, localNumberError } from "@/shared/ui/PhoneInput";
import { useAuth } from "@/features/auth/context";
import { guessCountry, splitNumber, type DialCode } from "@/shared/lib/dialCodes";
import { randomPresetAvatar, fetchPresetAvatarBlob } from "@/shared/lib/presetAvatars";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";

 
export function ProfileStep({ onDone }: { onDone: () => void }) {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const fileInput = useRef<HTMLInputElement | null>(null);

  const initial = splitNumber(user?.mobile ?? "");
  // Prefilled from signup, or from Google's profile — shown rather than hidden
  // so it can be corrected here, which is the only chance before it starts
  // appearing on reports.
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [country, setCountry] = useState<DialCode>(user?.mobile ? initial.country : guessCountry());
  const [local, setLocal] = useState(initial.local);

  const [firstError, setFirstError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [pending, setPending] = useState<File | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

  const pickAvatar = (file: File | null) => {
    if (file) setPending(file);
    // Cleared so picking the same file twice still reopens the cropper — the
    // input fires no change event when the value hasn't moved.
    if (fileInput.current) fileInput.current.value = "";
  };

  // A brand-new account gets a random preset rather than a blank initial —
  // this step is the first place any avatar could exist, so a fresh signup
  // (no avatar yet, nothing chosen already this session) is the one case
  // that means "just created."
  const defaultedRef = useRef(false);
  useEffect(() => {
    if (defaultedRef.current || user?.avatarUrl) return;
    defaultedRef.current = true;
    void (async () => {
      try {
        const blob = await fetchPresetAvatarBlob(randomPresetAvatar());
        await uploadAvatar(blob);
      } catch {
        // Silent: a missing default avatar is not worth interrupting signup for.
      }
    })();
  }, [user?.avatarUrl, uploadAvatar]);

  const pickPreset = async (src: string) => {
    setPresetOpen(false);
    setAvatarBusy(true);
    try {
      const blob = await fetchPresetAvatarBlob(src);
      await uploadAvatar(blob);
    } catch (e) {
      notifyError(e, "Could not use that avatar.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const confirmAvatar = async (cropped: Blob) => {
    setAvatarBusy(true);
    try {
      await uploadAvatar(cropped);
      setPending(null);
    } catch (e) {
      notifyError(e, "Could not upload that photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const clearAvatar = async () => {
    setAvatarBusy(true);
    try {
      await removeAvatar();
    } catch (e) {
      notifyError(e, "Could not remove the photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const submit = async () => {
    const fErr = firstName.trim() ? null : "Enter your first name";
    const pErr = localNumberError(local);
    setFirstError(fErr);
    setPhoneError(pErr);
    if (fErr || pErr) return;

    trace(user?.id, "onboarding_profile_saved", "onboarding", "profile");
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: joinNumber(country, local),
      });
      onDone();
    } catch (e) {
      notifyError(e, "Could not save your details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="xl">
 
      <Group gap="lg" wrap="nowrap">
        <div style={{ position: "relative" }}>
          <Avatar
            src={user?.avatarUrl || undefined}
            size={76}
            radius="50%"
            color="emerald"
          >
            <UserRound size={30} />
          </Avatar>
          <ActionIcon
            size="sm"
            radius="xl"
            variant="filled"
            loading={avatarBusy}
            onClick={() => fileInput.current?.click()}
            style={{ position: "absolute", right: 0, bottom: 0 }}
            aria-label="Upload a photo"
          >
            <Camera size={13} />
          </ActionIcon>
        </div>

        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={500}>Profile photo</Text>
          <Text size="xs" c="dimmed" mt={2}>
            Optional. JPG or PNG, up to 3MB — or pick one below.
          </Text>
          <Group gap="xs" mt={6}>
            <AvatarPresetPicker opened={presetOpen} onClose={() => setPresetOpen(false)} onPick={(src) => void pickPreset(src)}>
              <Button
                size="compact-xs"
                variant="light"
                leftSection={<Sparkles size={12} />}
                onClick={() => setPresetOpen((v) => !v)}
                disabled={avatarBusy}
              >
                Choose an avatar
              </Button>
            </AvatarPresetPicker>
            {user?.avatarUrl && (
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                leftSection={<Trash2 size={12} />}
                onClick={clearAvatar}
                disabled={avatarBusy}
              >
                Remove
              </Button>
            )}
          </Group>
        </div>
      </Group>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => pickAvatar(e.currentTarget.files?.[0] ?? null)}
      />

      <Group grow align="flex-start">
        <TextInput
          size="md"
          label="First name"
          placeholder="Ada"
          value={firstName}
          error={firstError}
          onChange={(e) => {
            setFirstName(e.currentTarget.value);
            setFirstError(null);
          }}
        />
        <TextInput
          size="md"
          label="Last name"
          placeholder="Lovelace"
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
        />
      </Group>

      <PhoneInput
        autoFocus
        country={country}
        onCountry={setCountry}
        local={local}
        onLocal={(v) => {
          setLocal(v);
          setPhoneError(null);
        }}
        error={phoneError}
        description="Used for WhatsApp report delivery. We never share it."
      />

 

      <Button
        className="auth-btn"
        size="md"
        fullWidth
        loading={saving}
        onClick={submit}
        rightSection={<ArrowRight size={16} />}
      >
        Continue
      </Button>

      <AvatarCropper
        file={pending}
        busy={avatarBusy}
        onCancel={() => setPending(null)}
        onConfirm={confirmAvatar}
      />
    </Stack>
  );
}
