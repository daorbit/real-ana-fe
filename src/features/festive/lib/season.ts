const DIWALI_FROM = "2026-10-25";
const DIWALI_UNTIL = "2026-11-15";

function localDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isDiwaliSeason(now: Date = new Date()) {
  const today = localDay(now);
  return today >= DIWALI_FROM && today <= DIWALI_UNTIL;
}
