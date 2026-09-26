import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
import {
  api, setToken, clearToken, getToken,
  startImpersonating, stopImpersonating,
} from "@/shared/lib/http";
import { api as rtkApi } from "@/app/store";
import { setDatePrefs } from "@/shared/lib";
import { trace } from "@/shared/lib/analytics";
import { rememberUser, type LoginMethod } from "@/features/auth/lastUser";
import { hideLock, showLock } from "@/shared/lib/lockState";
import type { ProfileUpdate, User } from "@/shared/types";
import type { IdentityProof } from "@/features/auth/components/settings/identityProof";

type AuthState = {
  user: User | null;
  loading: boolean;
  isDemo: boolean;


  login: (
    email: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<{ requires2fa: false } | { requires2fa: true; pendingToken: string }>;
  verifyTotp: (pendingToken: string, code: string, method?: LoginMethod) => Promise<void>;

  googleSignIn: (
    credential: string,
  ) => Promise<{ requires2fa: false; created: boolean } | { requires2fa: true; pendingToken: string }>;

  adoptToken: (token: string) => Promise<void>;
  /** Starts a signup and emails a code. No account exists until `verifySignup`. */
  signup: (email: string, password: string, name: string) => Promise<void>;
  /** Proves the code and creates the account, signing the user in. */
  verifySignup: (email: string, code: string) => Promise<void>;
  resendSignupCode: (email: string) => Promise<void>;
  /** Emails a reset code. Resolves whether or not the address has an account. */
  forgotPassword: (email: string) => Promise<void>;
  /** Proves the code, sets the new password, and signs in. */
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  resendResetCode: (email: string) => Promise<void>;
  /** Change (or set) the password from inside the app. */
  changePassword: (newPassword: string, currentPassword?: string) => Promise<void>;
  /** Set or replace the screen-lock PIN. */
  setPin: (newPin: string, currentPin?: string) => Promise<void>;
  /** Turn the idle screen lock on. `pin` is required the first time unless
   * 2FA is already on. */
  enableScreenLock: (pin?: string) => Promise<void>;
  disableScreenLock: (proof: IdentityProof) => Promise<void>;
  lockScreenNow: () => Promise<void>;
  /** Prove the PIN or a TOTP code and clear the lock. */
  unlockScreen: (proof: { pin: string } | { totpCode: string }) => Promise<void>;
  startDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;

  uploadAvatar: (file: Blob) => Promise<void>;
  removeAvatar: () => Promise<void>;
  impersonate: (userId: string) => Promise<void>;
  exitImpersonation: () => Promise<void>;
  /** Re-fetch the profile — used after a billing action changes `user.billing`. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

type AuthResp = { token: string; user: User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Every date helper reads these, so they have to be in place before the app
  // renders anything dated — and re-applied when the user edits them.
  useEffect(() => {
    setDatePrefs({ locale: user?.dateLocale, timeZone: user?.timezone });
  }, [user?.dateLocale, user?.timezone]);

  // On mount, restore session if token present
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/api/auth/me")
      .then((me) => {
        setUser(me);
        // Before `setLoading(false)`, so `LockScreen` is already seeded from
        // `isLocked()` on its very first render rather than waiting for a
        // notify it was not yet subscribed to.
        if (me.locked) showLock();
      })
      .catch((e: { status?: number }) => {
        // A 423 is a locked account, not a dead session — clearing the token
        // here would log someone out for locking their screen. `/me` answers
        // while locked by design, but a future guard on it must not turn into
        // a logout.
        if (e?.status === 423) {
          showLock();
          return;
        }
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, turnstileToken?: string) => {
    const r = await api.post<AuthResp | { requires2fa: true; pendingToken: string }>(
      "/api/auth/login",
      {
        email,
        password,
        ...(turnstileToken ? { turnstileToken } : {}),
      },
    );
    if ("requires2fa" in r) return { requires2fa: true as const, pendingToken: r.pendingToken };

    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    setUser(r.user);
    rememberUser(r.user, "password");
    trace(r.user.id, "login", "login", "app");
    return { requires2fa: false as const };
  };

  const verifyTotp = async (pendingToken: string, code: string, method: LoginMethod = "password") => {
    const r = await api.post<AuthResp>("/api/auth/2fa/verify", { pendingToken, code });
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    setUser(r.user);
    rememberUser(r.user, method);
    trace(r.user.id, "login", "login_2fa", "app");
  };

  const googleSignIn = async (credential: string) => {
    const r = await api.post<
      (AuthResp & { created?: boolean }) | { requires2fa: true; pendingToken: string }
    >("/api/auth/google", { credential });
    if ("requires2fa" in r) return { requires2fa: true as const, pendingToken: r.pendingToken };

    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    if (r.created) {
      // A brand-new account must not inherit the onboarding flags a previous
      // account left in this browser.
      localStorage.removeItem("quantalog_onboarding_skipped");
      localStorage.removeItem("quantalog_onboarding_dismissed");
      localStorage.removeItem("rta_active_ws");
    }
    setUser(r.user);
    rememberUser(r.user, "google");
    trace(r.user.id, r.created ? "signup" : "login", "google_signin", "app");
    return { requires2fa: false as const, created: Boolean(r.created) };
  };

  const adoptToken = async (token: string) => {
    setToken(token);
    dispatch(rtkApi.util.resetApiState());
    const me = await api.get<AuthResp["user"]>("/api/auth/me");
    setUser(me);
    rememberUser(me, "linkedin");
    trace(me.id, "login", "linkedin_signin", "app");
  };

  const startDemo = async () => {
    const r = await api.post<AuthResp>("/api/auth/demo", {});
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    localStorage.removeItem("rta_active_ws");
    setUser({ ...r.user, demo: true });
  };

  const signup = async (email: string, password: string, name: string) => {
    await api.post("/api/auth/signup", { email, password, name });
  };

  const verifySignup = async (email: string, code: string) => {
    const r = await api.post<AuthResp>("/api/auth/signup/verify", { email, code });
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    // A previous account may have skipped setup on this browser; the flag is
    // per-browser, so a new account has to start with a clean slate.
    localStorage.removeItem("quantalog_onboarding_skipped");
    localStorage.removeItem("quantalog_onboarding_dismissed");
    setUser(r.user);
    rememberUser(r.user, "password");
    trace(r.user.id, "signup", "signup_verify", "app");
  };

  const resendSignupCode = async (email: string) => {
    await api.post("/api/auth/signup/resend", { email });
  };

  /**
   * Start a password reset.
   *
   * Always resolves, even for an address with no account — the server answers
   * identically either way on purpose, so that this flow cannot be used to
   * find out who has an account here.
   */
  const forgotPassword = async (email: string) => {
    await api.post("/api/auth/forgot-password", { email });
  };

  /** Prove the code and set the new password. Signs in on success. */
  const resetPassword = async (email: string, code: string, password: string) => {
    const r = await api.post<AuthResp>("/api/auth/reset-password", { email, code, password });
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    setUser(r.user);
    trace(r.user.id, "login", "password_reset", "app");
  };

  const resendResetCode = async (email: string) => {
    await api.post("/api/auth/forgot-password/resend", { email });
  };

  const changePassword = async (newPassword: string, currentPassword?: string) => {
    const updated = await api.post<User>("/api/auth/me/password", {
      newPassword,
      ...(currentPassword ? { currentPassword } : {}),
    });
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const setPin = async (newPin: string, currentPin?: string) => {
    const updated = await api.post<User>("/api/auth/me/pin", {
      newPin,
      ...(currentPin ? { currentPin } : {}),
    });
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const enableScreenLock = async (pin?: string) => {
    const updated = await api.post<User>("/api/auth/me/screen-lock/enable", {
      ...(pin ? { pin } : {}),
    });
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const disableScreenLock = async (proof: IdentityProof) => {
    await api.post("/api/auth/me/screen-lock/disable", proof);
    setUser((prev) => (prev ? { ...prev, screenLockEnabled: false } : prev));
  };

  const lockScreenNow = async () => {
    const r = await api.post<{ ok: boolean; locked?: boolean }>("/api/auth/lock", {});
    if (r.locked) showLock();
  };

  const unlockScreen = async (proof: { pin: string } | { totpCode: string }) => {
    await api.post("/api/auth/unlock", proof);
    hideLock();
    /*
     * Refetch everything the lock refused.
     *
     * While locked, every data route answers 423, and RTK Query caches those
     * rejections like any other result. Lifting the overlay does not retry
     * them, so the app came back to a screen of dead panels and the only way
     * out was a manual reload.
     *
     * `resetApiState` rather than `invalidateTags`: invalidation drives off
     * `providesTags`, which does not run for a failed query — a cache entry
     * holding an error has no tags to match, so invalidating would skip
     * exactly the entries that need retrying. Dropping the cache makes every
     * mounted query refetch from scratch, which is what is wanted here.
     *
     * The usual objection to this — components flashing through their loading
     * state — does not apply: the lock overlay has been covering them, so
     * there is nothing on screen to flash.
     */
    dispatch(rtkApi.util.resetApiState());
  };

  const updateProfile = async (patch: ProfileUpdate) => {
    const updated = await api.patch<User>("/api/auth/me", patch);
    // /api/auth/me does not echo `impersonating` on PATCH, and losing it would
    // drop the "you are viewing as …" banner mid-session.
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  /** The largest image the avatar endpoint accepts, matched here so an oversized
   *  file is refused before it is read and encoded rather than after. */
  const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

  const uploadAvatar = async (file: Blob) => {
    if (!file.type.startsWith("image/"))
      throw new Error("That file isn't an image.");
    // The cropper's output is well under this; the check is for the raw-file
    // path and for anything that bypasses cropping.
    if (file.size > MAX_AVATAR_BYTES)
      throw new Error("Image must be 3MB or smaller.");

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });

    const updated = await api.post<User>("/api/auth/me/avatar", { file: dataUrl });
    // As with updateProfile: the endpoint does not echo `impersonating`, and
    // losing it would drop the "you are viewing as …" banner.
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const removeAvatar = async () => {
    const updated = await api.delFor<User>("/api/auth/me/avatar");
    setUser((prev) => ({ ...updated, impersonating: prev?.impersonating }));
  };

  const logout = () => {
    if (user?.id) trace(user.id, "logout", "app", "login");
    clearToken();
    hideLock();
    setUser(null);
    // Drop every cached response — otherwise the next user to log in on this
    // browser would briefly see the previous user's workspaces and stats.
    dispatch(rtkApi.util.resetApiState());
  };

  const impersonate = async (userId: string) => {
    const r = await api.post<AuthResp>(`/api/admin/impersonate/${userId}`, {});
    startImpersonating(r.token);
    dispatch(rtkApi.util.resetApiState());
    setUser({ ...r.user, impersonating: true });
    localStorage.removeItem("rta_active_ws");
  };

  const exitImpersonation = async () => {
    if (!stopImpersonating()) return;
    dispatch(rtkApi.util.resetApiState());
    localStorage.removeItem("rta_active_ws");
    const me = await api.get<User>("/api/auth/me");
    setUser(me);
  };

  const refreshUser = async () => {
    const me = await api.get<User>("/api/auth/me");
    setUser((prev) => ({ ...me, impersonating: prev?.impersonating }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isDemo: Boolean(user?.demo), login, verifyTotp, googleSignIn, adoptToken, signup, verifySignup, resendSignupCode, forgotPassword, resetPassword, resendResetCode, changePassword, setPin, enableScreenLock, disableScreenLock, lockScreenNow, unlockScreen, startDemo, logout, updateProfile, uploadAvatar, removeAvatar, impersonate, exitImpersonation, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

export function useIsPlatformAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "super_admin" && !user?.impersonating;
}

export function useCanUseInstagram(): boolean {
  const { user } = useAuth();
  return user?.role === "super_admin";
}
