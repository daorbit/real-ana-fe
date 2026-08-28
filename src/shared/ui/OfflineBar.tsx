import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * A fixed strip along the top while the browser reports no connection.
 *
 * Without it, a dropped network shows up only as requests that quietly fail —
 * a save that does nothing, a page that will not refresh, with no single place
 * saying why. This states it once, and clears itself the moment `online` fires
 * again.
 */
export function OfflineBar() {
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" && navigator.onLine === false,
  );

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        insetInline: 0,
        top: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: 500,
        color: "#fff",
        background: "var(--mantine-color-red-7, #b91c1c)",
      }}
    >
      <WifiOff size={14} />
      You're offline — changes won't save until the connection is back.
    </div>
  );
}
