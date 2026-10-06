import { onIdle } from "@/shared/lib/idle";

type SentryModule = typeof import("@sentry/react");

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let loading: Promise<SentryModule | null> | null = null;
let currentUserId: string | null = null;

function captureEarly(event: ErrorEvent | PromiseRejectionEvent) {
  const error = "reason" in event ? event.reason : (event.error ?? event.message);
  void load().then((Sentry) => Sentry?.captureException(error));
}

function load(): Promise<SentryModule | null> {
  if (!DSN) return Promise.resolve(null);
  loading ??= import("@sentry/react")
    .then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_RELEASE,
        sendDefaultPii: false,
        tracesSampleRate: 0,
      });
      Sentry.setUser(currentUserId ? { id: currentUserId } : null);
      window.removeEventListener("error", captureEarly);
      window.removeEventListener("unhandledrejection", captureEarly);
      return Sentry;
    })
    .catch(() => null);
  return loading;
}

export function startErrorReporting(): void {
  if (!DSN) return;
  window.addEventListener("error", captureEarly);
  window.addEventListener("unhandledrejection", captureEarly);
  onIdle(() => void load(), 5000);
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!DSN) return;
  void load().then((Sentry) => Sentry?.captureException(error, context ? { extra: context } : undefined));
}

export function setReportingUser(userId: string | undefined): void {
  currentUserId = userId ?? null;
  if (!loading) return;
  void loading.then((Sentry) => Sentry?.setUser(currentUserId ? { id: currentUserId } : null));
}
