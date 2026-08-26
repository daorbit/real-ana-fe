import { useRef, useState } from "react";
import {
  Button, Group, Text, Title, TextInput, Stack, Avatar, ActionIcon, Alert,
} from "@mantine/core";
import { ArrowRight, Camera, Trash2, UserRound, Info } from "lucide-react";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { PhoneInput, joinNumber, localNumberError } from "@/shared/ui/PhoneInput";
import { useAuth } from "@/features/auth/context";
import { guessCountry, splitNumber, type DialCode } from "@/shared/lib/dialCodes";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";

/**
 * Who you are — the first onboarding step.
 *
 * Required rather than skippable, unlike the steps after it. The mobile number
 * is what WhatsApp report delivery sends to, so an account that skips this
 * finds the channel refusing to turn on, in a screen far from here and for a
 * reason that isn't obvious from there.
 *
 * Name arrives prefilled — typed at signup, or taken from Google — and stays
 * editable rather than hidden: this is the last point before it starts
 * appearing on reports that go to other people.
 *
 * The avatar is the one optional field, and it says so: a stock initial is a
 * perfectly good default, and blocking setup on a photo people don't have to
 * hand would cost more than it's worth.
 */
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

  const pickAvatar = (file: File | null) => {
    if (file) setPending(file);
    // Cleared so picking the same file twice still reopens the cropper — the
    // input fires no change event when the value hasn't moved.
    if (fileInput.current) fileInput.current.value = "";
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
      <div>
        <Title order={2} style={{ letterSpacing: "-0.02em" }}>
          Confirm your details
        </Title>
        <Text c="dimmed" size="sm" mt={8}>
          Your name appears on the reports you send. Your mobile is where
          WhatsApp alerts are delivered — a photo is optional.
        </Text>
      </div>

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
            style={{ position: "absolute", right: -2, bottom: -2 }}
            aria-label="Upload a photo"
          >
            <Camera size={13} />
          </ActionIcon>
        </div>

        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={500}>Profile photo</Text>
          <Text size="xs" c="dimmed" mt={2}>
            Optional. JPG or PNG, up to 3MB.
          </Text>
          {user?.avatarUrl && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              mt={6}
              leftSection={<Trash2 size={12} />}
              onClick={clearAvatar}
              disabled={avatarBusy}
            >
              Remove
            </Button>
          )}
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

      <Alert color="gray" variant="light" radius="md" p="xs" icon={<Info size={15} />}>
        <Text size="xs">
          You can change any of this later under Settings.
        </Text>
      </Alert>

      <Button
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
