// Display helpers shared by the student and admin pages

export const GENDER_LABELS: Record<string, string> = { male: "Male", female: "Female", other: "Other" };
export const CATEGORY_LABELS: Record<string, string> = { open: "Open", obc: "OBC", sc: "SC", st: "ST", ews: "EWS" };

// "2005-08-15" -> "15/08/2005"
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

// "2026-10-13T10:47:45Z" -> "13 October 2026"
export function formatLongDate(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatPercentage(value: number | null | undefined) {
  return value == null ? "-" : `${value.toFixed(2)}%`;
}
