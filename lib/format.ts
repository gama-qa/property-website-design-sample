// Indonesian formats: thousands with dots, decimals with a comma, Indonesian month names.
const number = new Intl.NumberFormat("id-ID");
const decimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** 95000000 -> "Rp 95.000.000" */
export function formatIDR(amount: number) {
  return `Rp ${number.format(amount)}`;
}

/** 0.9 -> "0,9" (pair with a "km" note) */
export function formatDistance(km: number) {
  return decimal.format(km);
}

/** "2027-01-04" -> "4 Jan 2027" (the ISO date is treated as a calendar date, not a moment). */
export function formatDate(iso: string) {
  return date.format(new Date(`${iso}T00:00:00Z`));
}
