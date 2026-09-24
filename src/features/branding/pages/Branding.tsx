import { Box } from "@mantine/core";
import { Palette } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { BrandingSkeleton } from "@/shared/ui/Skeletons";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace } from "@/features/workspace/context";
import { SaveBar } from "@/features/auth/components/settings/SaveBar";
import { useBrandingForm } from "../hooks/useBrandingForm";
import { BrandingAccessNotice } from "../components/BrandingAccessNotice";
import { IdentitySection } from "../components/IdentitySection";
import { CreditsSection } from "../components/CreditsSection";
import { BrandingPreview } from "../components/preview/BrandingPreview";
import classes from "../components/Branding.module.css";

export default function BrandingPage() {
  useTitle("Branding");
  const { active } = useWorkspace();
  const form = useBrandingForm(active?._id ?? "");

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={Palette}
          title="No workspace selected"
          description="Choose a workspace from the switcher to set how its forms and payment windows are branded."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={form.submit}>
        <PageHeader
          title="Branding"
          description={`Choose the name, logo and colour people see on ${active.name}'s forms and payment windows.`}
        />

        {form.isLoading ? (
          <BrandingSkeleton />
        ) : form.loadFailed ? (
          <ErrorState
            title="Couldn't load branding"
            onRetry={() => void form.retry()}
            retrying={form.retrying}
          />
        ) : (
          <Box className={classes.layout}>
            <Box className={classes.main}>
              <BrandingAccessNotice form={form} />
              <IdentitySection form={form} />
              <CreditsSection form={form} />
            </Box>
            <Box className={classes.aside}>
              <BrandingPreview form={form} />
            </Box>
            {form.dirty && <Box className={classes.saveSpacer} aria-hidden />}
          </Box>
        )}

        {form.dirty && <SaveBar saving={form.saving} onDiscard={form.reset} />}
      </form>
    </AppShell>
  );
}
