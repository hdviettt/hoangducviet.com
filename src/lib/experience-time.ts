/**
 * Month maths for the career timeline.
 *
 * Shared, because two views read the same dates and must not disagree: the
 * homepage column prints durations, and the About chart sizes blocks by them.
 *
 * Everything here is months. A day would be precision the source does not
 * have -- the CMS stores "2025-05", not a date.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ym(s: string): { y: number; m: number } {
  const [y, m] = s.split("-").map(Number);
  return { y, m };
}

export function fmtMonth(s: string): string {
  const { y, m } = ym(s);
  return `${MONTHS[m - 1]} ${y}`;
}

/**
 * A single number per month, so two dates can be compared and subtracted.
 * January of year 0 is 1, so the scale never goes negative for real data.
 */
export function monthIndex(s: string): number {
  const { y, m } = ym(s);
  return y * 12 + m;
}

export function nowIndex(now: Date): number {
  return now.getFullYear() * 12 + now.getMonth() + 1;
}

/** The month index of the January that opens `year`. */
export function januaryIndex(year: number): number {
  return year * 12 + 1;
}

/**
 * Inclusive month count, which is how LinkedIn tallies tenure: both endpoint
 * months count, so Aug to Aug is 13 months and not 12. Matching that matters
 * only because a reader who has both open should not find two numbers.
 *
 * Note this is one more than `endIndex - startIndex`. The chart lays blocks
 * out on the exclusive span, because that is elapsed time and it is what has
 * to add up across a continuous axis; the printed duration uses this.
 */
export function monthsInclusive(
  start: string,
  end: string | undefined,
  now: Date,
): number {
  const s = ym(start);
  const e = end ? ym(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  return (e.y - s.y) * 12 + (e.m - s.m) + 1;
}

export function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}
