/**
 * Thin, typed wrapper around the tracker's `window.rta` global.
 *
 * `window.rta` only exists once tracker.js has loaded (async script tag), so
 * every call here is a no-op until then rather than a crash — the same
 * best-effort contract the tracker itself uses for a dropped beacon.
 */
type Rta = {
  identify: (userId: string) => void;
  reset: () => void;
  track: (
    action: string,
    opts?: { source?: string; destination?: string; props?: Record<string, unknown> },
  ) => void;
};

declare global {
  interface Window {
    rta?: Rta;
  }
}

export const analytics = {
  identify(userId: string) {
    window.rta?.identify(userId);
  },
  reset() {
    window.rta?.reset();
  },
  track(
    action: string,
    opts?: { source?: string; destination?: string; props?: Record<string, unknown> },
  ) {
    window.rta?.track(action, opts);
  },
};
