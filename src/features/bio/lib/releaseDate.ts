import { formatDate } from "@/shared/lib";

export function upcomingLabel(releaseDate: string): string | null {
  if (!releaseDate) return null;
  const date = new Date(`${releaseDate}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null;
  return `Out ${formatDate(date, { day: "numeric", month: "long", year: "numeric" })}`;
}
