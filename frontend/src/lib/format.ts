/** Date and text formatting. Uses Intl rather than a date library. */

const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const FULL_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function monthYear(iso: string): string {
  return MONTH_YEAR.format(new Date(iso));
}

export function fullDate(iso: string): string {
  return FULL_DATE.format(new Date(iso));
}

/** "Jan 2024 — Present" for an open-ended role. */
export function dateRange(start: string, end: string | null): string {
  return `${monthYear(start)} — ${end ? monthYear(end) : "Present"}`;
}

export function year(iso: string): string {
  return new Date(iso).getUTCFullYear().toString();
}

/** Two-digit index for list markers, e.g. 1 → "01". */
export function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
