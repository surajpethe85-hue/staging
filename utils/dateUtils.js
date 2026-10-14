/**
 * dateUtils - reusable date/time helpers commonly needed in tests
 * (timestamps for unique data, formatted dates for forms & assertions).
 */

/** Current timestamp in ms (great for unique IDs/screenshot names). */
export function timestamp() {
  return Date.now();
}

/**
 * Today's date formatted as YYYY-MM-DD (or a custom separator).
 * @param {string} [separator='-']
 */
export function today(separator = "-") {
  const d = new Date();
  return format(d, separator);
}

/**
 * Return a date offset from today by a number of days.
 * @param {number} days positive = future, negative = past
 * @param {string} [separator='-']
 */
export function addDays(days, separator = "-") {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return format(d, separator);
}

/**
 * Format a Date object as YYYY[sep]MM[sep]DD.
 * @param {Date} date
 * @param {string} [separator='-']
 */
export function format(date, separator = "-") {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${separator}${mm}${separator}${dd}`;
}

/** Human-readable timestamp: YYYY-MM-DD_HH-mm-ss (safe for filenames). */
export function fileTimestamp() {
  const d = new Date();
  const date = format(d, "-");
  const time = `${String(d.getHours()).padStart(2, "0")}-${String(
    d.getMinutes(),
  ).padStart(2, "0")}-${String(d.getSeconds()).padStart(2, "0")}`;
  return `${date}_${time}`;
}

export default { timestamp, today, addDays, format, fileTimestamp };
