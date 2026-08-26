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
import type { ProfileUpdate, User } from "@/shared/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  /**
   * `turnstileToken` is the Cloudflare challenge token the login form collected.
   * Optional so a deployment with no sitekey configured still calls this the
   * same way — the server decides whether a token was required.
   */
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  /**
   * Exchange a Google credential for a session. Serves signup and login both —
   * Google has already proved the address, so a first-time user is created here.
   * Resolves with whether the account was just created, so the caller can send
   * new users to onboarding.
   */
  googleSignIn: (credential: string) => Promise<{ created: boolean }>;
  /**
   * Adopt a session from a token the server issued during a redirect flow.
   *
   * Used by LinkedIn sign-in, where the token comes back in the URL rather than
   * in a response body — there is no credential left to exchange by then.
   */
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
  startDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (patch: ProfileUpdate) => Promise<void>;
  /**
   * Upload a new profile picture. Takes the image itself, not a data URL — the
   * encoding is this layer's business, not the form's. A Blob rather than a File
   * because the cropper produces one. Saves immediately.
   */
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
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, turnstileToken?: string) => {
    const r = await api.post<AuthResp>("/api/auth/login", {
      email,
      password,
      // Omitted rather than sent as undefined when there is none, so the payload
      // is unchanged on a build with Turnstile switched off.
      ...(turnstileToken ? { turnstileToken } : {}),
    });
    setToken(r.token);
    // Start from a clean cache so nothing from a previous session leaks through.
    dispatch(rtkApi.util.resetApiState());
    setUser(r.user);
    trace(r.user.id, "login", "login", "app");
  };

  const googleSignIn = async (credential: string) => {
    const r = await api.post<AuthResp & { created?: boolean }>(
      "/api/auth/google",
      { credential }
    );
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
    trace(r.user.id, r.created ? "signup" : "login", "google_signin", "app");
    return { created: Boolean(r.created) };
  };

  /**
   * Adopt a session from a token the server already issued.
   *
   * LinkedIn sign-in is a redirect flow, not a request/response one: by the
   * time the browser is back here the server has verified the profile and
   * signed a token, and it arrives in the URL rather than in a response body.
   * So there is no credential left to post — the work is to store the token and
   * load the account it belongs to.
   */
  const adoptToken = async (token: string) => {
    setToken(token);
    dispatch(rtkApi.util.resetApiState());
    const me = await api.get<AuthResp["user"]>("/api/auth/me");
    setUser(me);
    trace(me.id, "login", "linkedin_signin", "app");
  };

  const startDemo = async () => {
    const r = await api.post<AuthResp>("/api/auth/demo", {});
    setToken(r.token);
    dispatch(rtkApi.util.resetApiState());
    localStorage.removeItem("rta_active_ws");
    setUser({ ...r.user, demo: true });
  };

  // Signing up no longer signs anyone in: it only stashes the details server-
  // side and sends a code. Nothing local changes until the code is verified.
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
    setUser(null);
    // Drop every cached response — otherwise the next user to log in on this
    // browser would briefly see the previous user's workspaces and stats.
    dispatch(rtkApi.util.resetApiState());
  };

  const impersonate = async (userId: string) => {
    const r = await api.post<AuthResp>(`/api/admin/impersonate/${userId}`, {});
    startImpersonating(r.token);
    // The cache is full of the admin's own workspaces and stats. Clearing it is
    // what makes the switch complete rather than cosmetic.
    dispatch(rtkApi.util.resetApiState());
    setUser({ ...r.user, impersonating: true });
    // The active workspace is remembered per browser, and it belongs to the
    // admin — leaving it would point every query at a workspace this user
    // cannot see.
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
      value={{ user, loading, isDemo: Boolean(user?.demo), login, googleSignIn, adoptToken, signup, verifySignup, resendSignupCode, forgotPassword, resetPassword, resendResetCode, startDemo, logout, updateProfile, uploadAvatar, removeAvatar, impersonate, exitImpersonation, refreshUser }}
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

/**
 * Whether the admin module is visible to this session.
 *
 * `super_admin` only. The platform `admin` role still exists and still passes
 * the server's `requireAdmin` gate, but the console — impersonation, broadcast
 * email, the plan catalogue — is not something it gets to see.
 *
 * Impersonation is excluded outright: acting as someone else must not carry the
 * admin console along with it, or an impersonated session becomes a way to
 * impersonate onward.
 *
 * One helper rather than the same two-way comparison in six files, so
 * tightening it again later is one edit, not six.
 */
export function useIsPlatformAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "super_admin" && !user?.impersonating;
}
