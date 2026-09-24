import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useGetBrandingQuery, useUpdateBrandingMutation } from "@/app/store";
import { usePermissions } from "@/features/workspace/context";
import { useUnsavedGuard, useEscapeDiscard } from "@/shared/hooks";
import { notify, errMessage } from "@/shared/lib/notify";
import { FALLBACK_BRAND_NAME, FALLBACK_POWERED_BY } from "../constants";

export function useBrandingForm(workspaceId: string) {
  const { canAdmin } = usePermissions();
  const { data, isLoading } = useGetBrandingQuery(workspaceId, { skip: !workspaceId });
  const [save, { isLoading: saving }] = useUpdateBrandingMutation();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [watermarkAiImages, setWatermarkAiImages] = useState(true);
  const [logoBroken, setLogoBroken] = useState(false);

  const reset = useCallback(() => {
    if (!data) return;
    setName(data.stored.name ?? "");
    setLogoUrl(data.stored.logoUrl ?? "");
    setAccentColor(data.stored.accentColor ?? "");
    setShowPoweredBy(!data.stored.hidePoweredBy);
    setWatermarkAiImages(data.stored.watermarkAiImages);
  }, [data]);

  useEffect(reset, [reset]);
  useEffect(() => setLogoBroken(false), [logoUrl]);

  const editable = Boolean(data?.editable);
  const locked = !editable || !canAdmin;

  const dirty =
    !!data &&
    !locked &&
    (name !== (data.stored.name ?? "") ||
      logoUrl !== (data.stored.logoUrl ?? "") ||
      accentColor !== (data.stored.accentColor ?? "") ||
      showPoweredBy === data.stored.hidePoweredBy ||
      watermarkAiImages !== data.stored.watermarkAiImages);

  useUnsavedGuard(dirty, "Your branding changes haven't been saved.");
  useEscapeDiscard(dirty && !saving, reset);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (locked) return;
    try {
      await save({
        workspaceId,
        name,
        logoUrl,
        accentColor,
        hidePoweredBy: !showPoweredBy,
        watermarkAiImages,
      }).unwrap();
      notify.success("Your forms and payment windows now use it.", "Branding saved");
    } catch (err) {
      notify.error(errMessage(err));
    }
  };

  return {
    data,
    isLoading,
    saving,
    editable,
    canAdmin,
    locked,
    dirty,
    reset,
    submit,
    name,
    setName,
    logoUrl,
    setLogoUrl,
    logoBroken,
    setLogoBroken,
    accentColor,
    setAccentColor,
    showPoweredBy: editable ? showPoweredBy : true,
    setShowPoweredBy,
    watermarkAiImages: editable ? watermarkAiImages : true,
    setWatermarkAiImages,
    poweredByLabel: data?.poweredByLabel ?? FALLBACK_POWERED_BY,
    defaultName: data?.defaults.name ?? FALLBACK_BRAND_NAME,
    defaultLogo: data?.defaults.logoUrl,
  };
}

export type BrandingForm = ReturnType<typeof useBrandingForm>;
