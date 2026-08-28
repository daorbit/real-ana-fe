import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { useUnsavedGuard } from "@/shared/hooks";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { mobileError } from "./constants";

export function useProfileForm() {
  const { t } = useTranslation();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();

  const fileInput = useRef<HTMLInputElement | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
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

  const seedFromUser = useCallback(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setMobile(user.mobile ?? "");
    setDateLocale(user.dateLocale ?? "");
    setTimezone(user.timezone ?? "");
    setErrors({});
    setAvatarBroken(false);
  }, [user]);

  useEffect(() => {
    seedFromUser();
  }, [user?.id, user?.impersonating]);

  const dirty =
    !!user &&
    (firstName !== (user.firstName ?? "") ||
      lastName !== (user.lastName ?? "") ||
      mobile !== (user.mobile ?? "") ||
      dateLocale !== (user.dateLocale ?? "") ||
      timezone !== (user.timezone ?? ""));

  useUnsavedGuard(dirty, t("settings.unsavedGuard"));

  useEffect(() => {
    if (!dirty || saving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[role="listbox"]')) return;
      e.preventDefault();
      seedFromUser();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, seedFromUser]);

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
      mobile: mobileError(mobile),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    trace(user?.id, "profile_saved", "settings", "profile");
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.trim(),
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

  const pickAvatar = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error(t("settings.avatarNotImage"));
      return;
    }
    setCropFile(file);
    if (fileInput.current) fileInput.current.value = "";
  };

  const saveCrop = async (cropped: Blob) => {
    trace(user?.id, "avatar_uploaded", "settings", "profile");
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
    trace(user?.id, "avatar_removed", "settings", "profile");
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
    fileInput,
    avatarBusy,
    cropFile,
    setCropFile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    mobile,
    setMobile,
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
    seedFromUser,
    submit,
    pickAvatar,
    saveCrop,
    clearAvatar,
    errText,
  };
}

export type ProfileForm = ReturnType<typeof useProfileForm>;
