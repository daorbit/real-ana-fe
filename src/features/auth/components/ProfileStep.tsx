import { useEffect, useRef, useState } from "react";
import {
  Button, TextInput, Stack, Avatar, Loader, UnstyledButton,
} from "@mantine/core";
import { ArrowRight, Camera, Sparkles, Trash2, Upload, UserRound } from "lucide-react";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { AvatarPresetPicker } from "@/shared/ui/AvatarPresetPicker";
import { PhoneInput, joinNumber, localNumberError } from "@/shared/ui/PhoneInput";
import { useAuth } from "@/features/auth/context";
import { guessCountry, splitNumber, type DialCode } from "@/shared/lib/dialCodes";
import { randomPresetAvatar, fetchPresetAvatarBlob } from "@/shared/lib/presetAvatars";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import onb from "@/features/auth/components/onboarding/Onboarding.module.css";
import f from "@/features/auth/components/onboarding/FormSteps.module.css";

 
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

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  return (
    <Stack gap={0}>
      {/* Who you are, as teammates will see it — fills in as you type. */}
      <div className={f.identity}>
        <div className={f.ring}>
          <div className={f.ringInner}>
            <UnstyledButton
              className={f.avatarBtn}
              onClick={() => fileInput.current?.click()}
              disabled={avatarBusy}
              aria-label="Upload a photo"
            >
              <Avatar src={user?.avatarUrl || undefined} size="100%" radius="50%" color="gray">
                {avatarBusy ? <Loader size="xs" /> : <UserRound size={26} />}
              </Avatar>
            </UnstyledButton>
          </div>
          <UnstyledButton
            className={f.badge}
            onClick={() => fileInput.current?.click()}
            disabled={avatarBusy}
            aria-label="Upload a photo"
          >
            <Camera size={13} />
          </UnstyledButton>
        </div>

        <div className={f.identityText}>
          <div className={f.identityName} data-empty={fullName ? undefined : true}>
            {fullName || "Your name"}
          </div>
          {user?.email && <div className={f.identityMeta}>{user.email}</div>}
          <div className={f.links}>
            <button
              type="button"
              className={f.link}
              onClick={() => fileInput.current?.click()}
              disabled={avatarBusy}
            >
              <Upload size={12} /> Upload photo
            </button>
            <AvatarPresetPicker opened={presetOpen} onClose={() => setPresetOpen(false)} onPick={(src) => void pickPreset(src)}>
              <button
                type="button"
                className={f.link}
                onClick={() => setPresetOpen((v) => !v)}
                disabled={avatarBusy}
              >
                <Sparkles size={12} /> Pick an avatar
              </button>
            </AvatarPresetPicker>
            {user?.avatarUrl && (
              <button
                type="button"
                className={f.link}
                data-danger
                onClick={clearAvatar}
                disabled={avatarBusy}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={f.fields}>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pickAvatar(e.currentTarget.files?.[0] ?? null)}
        />

        <div className={f.grid2}>
          <TextInput
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
            label="Last name"
            placeholder="Lovelace"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
          />
        </div>

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
      </div>

      {/* Rides the foot of the screen on a phone, like every other step's
          actions — see `.actionsBar` in Onboarding.module.css. */}
      <div className={`${onb.actionsBar} ${onb.actions}`} style={{ marginTop: "1.75rem" }}>
        <span className={onb.actionsBack} />
        <div className={onb.actionsMain}>
          <Button
            className={`auth-btn ${onb.actionsPrimary}`}
            size="sm"
            loading={saving}
            onClick={submit}
            rightSection={<ArrowRight size={15} />}
          >
            Continue
          </Button>
        </div>
      </div>

      <AvatarCropper
        file={pending}
        busy={avatarBusy}
        onCancel={() => setPending(null)}
        onConfirm={confirmAvatar}
      />
    </Stack>
  );
}
