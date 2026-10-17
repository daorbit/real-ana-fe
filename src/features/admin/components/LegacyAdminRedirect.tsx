import { Navigate, useLocation } from "react-router-dom";
import { adminSectionPath, type AdminSectionId } from "../lib/adminSections";

export function LegacyAdminRedirect({ section }: { section: AdminSectionId }) {
  const { search } = useLocation();
  return <Navigate to={`${adminSectionPath(section)}${search}`} replace />;
}
