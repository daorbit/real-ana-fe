import { Navigate, useParams } from "react-router-dom";
import { BIO_PUBLIC_PATH } from "@/features/bio/lib/bioOptions";

export default function LegacyBioRedirect() {
  const { slug = "" } = useParams<{ slug: string }>();
  return <Navigate to={`${BIO_PUBLIC_PATH}${slug}`} replace />;
}
