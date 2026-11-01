import { useIsPlatformAdmin } from "@/features/auth/context";

export function useInstagramAccess(): boolean {
  return useIsPlatformAdmin();
}
