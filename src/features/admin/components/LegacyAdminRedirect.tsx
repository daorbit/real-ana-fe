import { Navigate, useLocation } from "react-router-dom";
import { adminToolPath, type AdminTabId } from "../lib/adminTabs";

export function LegacyAdminRedirect({ tab }: { tab: AdminTabId }) {
  const { search } = useLocation();
  return <Navigate to={`${adminToolPath(tab)}${search}`} replace />;
}
