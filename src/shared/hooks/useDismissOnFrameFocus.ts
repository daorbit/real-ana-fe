import { useEffect } from "react";

function dismissFloatingLayers() {
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
}

export function useDismissOnFrameFocus() {
  useEffect(() => {
    const onBlur = () => {
      window.setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") dismissFloatingLayers();
      }, 0);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);
}
