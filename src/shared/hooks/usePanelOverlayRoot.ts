import { useEffect, useState } from "react";

export function usePanelOverlayRoot() {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(document.getElementById("panel-overlay-root"));
  }, []);

  return root;
}
