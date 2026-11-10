import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MonitorOff } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import {
  SecureDialog,
  SecureDialogButton,
  SecureDialogLink,
  SecureDialogLinks,
} from "@/features/auth/components/SecureDialog";
import { demoUnsupportedFeature } from "./demoRoutes";

export function DemoUnsupportedDialog() {
  const { isDemo, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<string | null>(null);

  const feature = isDemo ? demoUnsupportedFeature(pathname) : null;
  if (!feature || dismissed === pathname) return null;

  return (
    <SecureDialog
      onClose={() => setDismissed(pathname)}
      icon={MonitorOff}
      eyebrow="Live demo"
      title={`${feature} isn't in the demo`}
      description="This part of Quantalog needs a real workspace, so it can't run on sample data. Create a free account to try it."
    >
      <SecureDialogButton onClick={() => navigate("/app")}>Back to overview</SecureDialogButton>
      <SecureDialogLinks>
        <SecureDialogLink onClick={logout}>Exit demo and sign up</SecureDialogLink>
      </SecureDialogLinks>
    </SecureDialog>
  );
}
