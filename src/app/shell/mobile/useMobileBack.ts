import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { detailParent } from "./mobileRoute";

export function useMobileBack(pathname: string) {
  const navigate = useNavigate();
  const parent = detailParent(pathname);

  const goBack = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else if (parent) navigate(parent.to);
  }, [navigate, parent]);

  return { parent, goBack };
}
