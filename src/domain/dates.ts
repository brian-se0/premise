// Local-date helpers. Pure: callers pass the time in. Local dates are YYYY-MM-DD in the
// device's time zone; the day boundary is local midnight (ARCHITECTURE.md §6.5).

export type LocalDate = string;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function localDate(at: Date): LocalDate {
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

export function localDateOf(iso: string): LocalDate {
  return localDate(new Date(iso));
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return localDate(new Date(y, m - 1, d + days));
}

/** A card is due on a date when its due time falls on or before the end of that local date. */
export function isDueOn(dueIso: string, date: LocalDate): boolean {
  return localDateOf(dueIso) <= date;
}

/** Human date, e.g. "Mon 6 Oct". */
export function formatLocalDate(date: LocalDate): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}
