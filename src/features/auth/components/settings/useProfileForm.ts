import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { useUnsavedGuard, useEscapeDiscard } from "@/shared/hooks";
import { notify, errMessage } from "@/shared/lib/notify";
import { formatLocalNumber, guessCountry, splitNumber, type DialCode } from "@/shared/lib/dialCodes";
import { joinNumber, localNumberError } from "@/shared/ui/PhoneInput";

const digitsOf = (v: string) => v.replace(/[^\d]/g, "");

export function useProfileForm() {
  const { t } = useTranslation();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountry, setPhoneCountryState] = useState<DialCode>(guessCountry);
  const [phoneLocal, setPhoneLocalState] = useState("");
  const avatarUrl = user?.avatarUrl ?? "";
  const [dateLocale, setDateLocale] = useState("");
  const [timezone, setTimezone] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  const clearIfValid = (
    key: string,
    check: (v: string) => string | null,
    v: string,
  ) => {
    setErrors((prev) => (prev[key] && !check(v) ? { ...prev, [key]: null } : prev));
  };

  // Surface a field's error the moment focus leaves it, rather than only on
  // Save — a wrong phone number should be caught while the user is still
  // looking at it, not two fields later.
  const validateOnBlur = (
    key: string,
    check: (v: string) => string | null,
    v: string,
  ) => {
    setErrors((prev) => ({ ...prev, [key]: check(v) }));
  };

  const seedFromUser = useCallback(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    const split = splitNumber(user.mobile ?? "");
    setPhoneCountryState(user.mobile ? split.country : guessCountry());
    setPhoneLocalState(formatLocalNumber(split.country, split.local));
    setDateLocale(user.dateLocale ?? "");
    setTimezone(user.timezone ?? "");
    setErrors({});
    setAvatarBroken(false);
  }, [user]);

  useEffect(() => {
    seedFromUser();
  }, [user?.id, user?.impersonating]);

  const mobile = digitsOf(phoneLocal) ? joinNumber(phoneCountry, phoneLocal) : "";

  const setPhoneCountry = (next: DialCode) => {
    setPhoneCountryState(next);
    setPhoneLocalState((v) => formatLocalNumber(next, v));
  };

  const setPhoneLocal = (v: string) => {
    setPhoneLocalState(formatLocalNumber(phoneCountry, v));
    setErrors((prev) => (prev.mobile ? { ...prev, mobile: null } : prev));
  };

  const dirty =
    !!user &&
    (firstName !== (user.firstName ?? "") ||
      lastName !== (user.lastName ?? "") ||
      mobile !== digitsOf(user.mobile ?? "") ||
      dateLocale !== (user.dateLocale ?? "") ||
      timezone !== (user.timezone ?? ""));

  useUnsavedGuard(dirty, t("settings.unsavedGuard"));
  useEscapeDiscard(dirty && !saving, seedFromUser);

  const preview = (() => {
    try {
      return new Date().toLocaleString(dateLocale || undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || undefined,
      });
    } catch {
      return "—";
    }
  })();

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const next: Record<string, string | null> = {
      firstName: firstName.trim() ? null : "settings.firstNameRequired",
      mobile: digitsOf(phoneLocal) ? localNumberError(phoneLocal) : null,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile,
        dateLocale,
        timezone,
      });
      notify.success(t("settings.savedToast"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.saveError")));
    } finally {
      setSaving(false);
    }
  };

  /**
   * An avatar chosen from the workspace's media library.
   *
   * Fetched into a File so it goes through the same cropper as an upload: an
   * avatar is square wherever it is shown, and a library image is whatever
   * shape it happens to be. Cloudinary serves these with CORS, which is what
   * makes reading the blob back possible at all.
   */
  const pickAvatarFromLibrary = async (url: string, name: string) => {
    setAvatarBusy(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("could not load that image");
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) {
        notify.error(t("settings.avatarNotImage"));
        return;
      }
      setCropFile(new File([blob], name || "avatar", { type: blob.type }));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarUploadError")));
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveCrop = async (cropped: Blob) => {
    setAvatarBusy(true);
    try {
      await uploadAvatar(cropped);
      setAvatarBroken(false);
      setCropFile(null);
      notify.success(t("settings.avatarUploaded"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarUploadError")));
    } finally {
      setAvatarBusy(false);
    }
  };

  const clearAvatar = async () => {
    setAvatarBusy(true);
    try {
      await removeAvatar();
      setAvatarBroken(false);
      notify.success(t("settings.avatarRemoved"), t("common.saved"));
    } catch (err) {
      notify.error(errMessage(err, t("settings.avatarRemoveError")));
    } finally {
      setAvatarBusy(false);
    }
  };

  const errText = (key: string | null | undefined) => (key ? t(key) : undefined);

  return {
    user,
    avatarBusy,
    cropFile,
    setCropFile,
    pickAvatarFromLibrary,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneCountry,
    setPhoneCountry,
    phoneLocal,
    setPhoneLocal,
    avatarUrl,
    avatarBroken,
    setAvatarBroken,
    dateLocale,
    setDateLocale,
    timezone,
    setTimezone,
    errors,
    saving,
    dirty,
    preview,
    clearIfValid,
    validateOnBlur,
    seedFromUser,
    submit,
    saveCrop,
    clearAvatar,
    errText,
  };
}

export type ProfileForm = ReturnType<typeof useProfileForm>;
